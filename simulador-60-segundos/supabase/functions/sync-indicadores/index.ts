import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// sync-indicadores — roda 1x por dia (via cron do Supabase, ver instruções de deploy),
// busca dados públicos do Banco Central e grava em cache nas tabelas
// `indicadores_economicos` (Selic/TR/IPCA/Poupança) e `taxas_financiamento_bancos`
// (taxa de financiamento imobiliário por banco). O front-end (IndicadoresEconomicos.tsx)
// nunca chama o Banco Central direto — só lê essas duas tabelas via supabase-js.
//
// Fontes:
// - SGS (Sistema Gerenciador de Séries Temporais): api.bcb.gov.br, gratuita, sem chave.
//   Séries: 432 = Meta Selic (Copom), 226 = TR, 433 = IPCA mensal, 195 = Poupança.
// - Olinda (Taxas de Juros por Instituição Financeira): olinda.bcb.gov.br, gratuita,
//   sem chave. Filtrada pela modalidade "Financiamento imobiliário com taxas de
//   mercado - Pós-fixado referenciado em TR" (confirmado com o usuário: só essa
//   modalidade entra na V1, nada de veículo/consignado/etc).
//
// Nomes exatos de InstituicaoFinanceira confirmados direto na API (08/2026) — se o
// Banco Central mudar a razão social de algum banco no futuro, o filtro "contains"
// abaixo pode parar de encontrar esse banco e ele simplesmente some da comparação
// (silencioso, sem erro) — vale checar de vez em quando se os 5 continuam aparecendo.
const BCB_SGS_SERIES: Record<string, number> = {
  selic: 432,
  tr: 226,
  ipca: 433,
  poupanca: 195,
}

const MODALIDADE_IMOBILIARIO_TR =
  'Financiamento imobiliário com taxas de mercado - Pós-fixado referenciado em TR'

const BANCOS_ALVO = [
  'CAIXA ECONOMICA FEDERAL',
  'ITAÚ UNIBANCO',
  'BCO SANTANDER',
  'BCO BRADESCO',
  'BCO DO BRASIL',
]

// Cabeçalhos nas chamadas ao Banco Central (algumas APIs do governo recusam
// requisições sem Accept/User-Agent vindas de datacenter).
const BCB_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; Simulador60s-Sync/1.0)',
}

// SGS aceita datas no formato dd/MM/aaaa
function formatarDataBR(d: Date): string {
  const dia = String(d.getUTCDate()).padStart(2, '0')
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${d.getUTCFullYear()}`
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Busca uma série do SGS com tolerância a falhas do Banco Central. Já vimos HTTP 400
// e também resposta em XML (página de erro) no lugar do JSON, de forma intermitente.
// Por isso: até 3 rodadas, cada uma tentando "ultimos/24" e depois o formato com
// período (dataInicial/dataFinal, últimos 24 meses), com pausa crescente entre as
// rodadas. Só aceita resposta que seja de fato um JSON com lista não vazia. Se tudo
// falhar, o erro devolve um resumo das últimas falhas pra dar pra diagnosticar.
async function buscarSerieSGS(codigo: number): Promise<Array<{ data: string; valor: string }>> {
  const base = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados`
  const fim = new Date()
  const ini = new Date()
  ini.setUTCMonth(ini.getUTCMonth() - 24)
  const urls = [
    `${base}/ultimos/24?formato=json`,
    `${base}?formato=json&dataInicial=${formatarDataBR(ini)}&dataFinal=${formatarDataBR(fim)}`,
  ]

  const falhas: string[] = []
  for (let rodada = 1; rodada <= 3; rodada++) {
    for (const url of urls) {
      try {
        // Timeout por tentativa: sem ele, uma chamada que "pendura" no Banco Central
        // pode consumir minutos e estourar o tempo do cron (pg_net desiste em 60s).
        const resp = await fetch(url, { headers: BCB_HEADERS, signal: AbortSignal.timeout(12000) })
        const texto = await resp.text()
        if (!resp.ok) {
          falhas.push(`HTTP ${resp.status} [${texto.slice(0, 80)}]`)
          continue
        }
        let dados: unknown
        try {
          dados = JSON.parse(texto)
        } catch {
          falhas.push(`resposta nao-JSON [${texto.slice(0, 80)}]`)
          continue
        }
        if (Array.isArray(dados) && dados.length > 0) {
          return dados as Array<{ data: string; valor: string }>
        }
        falhas.push('resposta vazia ou em formato inesperado')
      } catch (e: any) {
        falhas.push(`falha de rede: ${e?.message || String(e)}`)
      }
    }
    if (rodada < 3) await sleep(1000 * rodada)
  }
  console.error(`SGS ${codigo} falhou em todas as tentativas:`, falhas)
  throw new Error(falhas.slice(-4).join(' | '))
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Proteção simples: se CRON_SECRET estiver configurado nas variáveis de ambiente
  // da function, só aceita chamadas que mandem o mesmo valor no header — evita que
  // alguém de fora fique disparando essa function à toa (ela não expõe dado nenhum
  // sensível, mas não custa nada travar). Se CRON_SECRET não estiver setado, a
  // function fica aberta (mais simples de configurar o cron no começo).
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret) {
    const provided = req.headers.get('x-cron-secret')
    if (provided !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return new Response(JSON.stringify({ error: 'Server Config Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Service role — necessário porque as tabelas só permitem SELECT via RLS pra
  // anon/authenticated; só a service role consegue fazer o upsert.
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const resultado = {
    indicadoresGravados: 0,
    bancosGravados: 0,
    erros: [] as string[],
  }

  // 1. Selic / TR / IPCA / Poupança via SGS
  // As 4 séries rodam em paralelo (com largada escalonada de 400ms entre elas, pra
  // não bater no Banco Central todas no mesmo instante). Antes rodavam em fila e o
  // total passava de 2 minutos quando o BCB oscilava.
  const series = Object.entries(BCB_SGS_SERIES)
  await Promise.all(series.map(async ([indicador, codigo], i) => {
    try {
      if (i > 0) await sleep(400 * i)
      const dados = await buscarSerieSGS(codigo)

      const agora = new Date().toISOString()
      // Algumas séries (ex: TR) podem devolver a mesma data mais de uma vez na mesma
      // resposta. O upsert recusa duas linhas com a mesma chave no mesmo lote
      // ("cannot affect row a second time"), então deduplicamos por data, ficando
      // com a última ocorrência de cada uma.
      const porData = new Map<string, { indicador: string; data_referencia: string; valor: number; atualizado_em: string }>()
      for (const item of dados) {
        // SGS devolve data no formato "dd/mm/aaaa"
        const [dia, mes, ano] = item.data.split('/')
        const dataRef = `${ano}-${mes}-${dia}`
        porData.set(dataRef, {
          indicador,
          data_referencia: dataRef,
          valor: parseFloat(item.valor),
          atualizado_em: agora,
        })
      }
      const linhas = Array.from(porData.values())

      const { error } = await supabaseAdmin
        .from('indicadores_economicos')
        .upsert(linhas, { onConflict: 'indicador,data_referencia' })

      if (error) throw error
      resultado.indicadoresGravados += linhas.length
    } catch (err: any) {
      console.error(`Erro ao sincronizar ${indicador}:`, err)
      resultado.erros.push(`${indicador}: ${err.message || String(err)}`)
    }
  }))

  // 2. Taxa de financiamento imobiliário por banco via Olinda
  try {
    const filtroModalidade = `Modalidade eq '${MODALIDADE_IMOBILIARIO_TR}'`
    const filtroBancos = BANCOS_ALVO.map((nome) => `contains(InstituicaoFinanceira,'${nome}')`).join(' or ')
    const filtro = `${filtroModalidade} and (${filtroBancos})`

    // $orderby=anoMes desc + pegamos só a primeira ocorrência de cada banco abaixo,
    // assim sempre ficamos com o mês mais recente já publicado, sem precisar saber
    // de antemão qual é (o BCB publica esse relatório com alguns dias de atraso).
    const url =
      'https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/odata/TaxasJurosMensalPorMes' +
      `?$filter=${encodeURIComponent(filtro)}&$orderby=anoMes desc&$top=40&$format=json`

    const resp = await fetch(url, { signal: AbortSignal.timeout(20000) })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)

    const payload = (await resp.json()) as {
      value: Array<{
        InstituicaoFinanceira: string
        anoMes: string
        TaxaJurosAoMes: number
        TaxaJurosAoAno: number
      }>
    }

    if (!payload.value || payload.value.length === 0) {
      throw new Error('resposta vazia ou em formato inesperado')
    }

    const maisRecentePorBanco = new Map<string, (typeof payload.value)[number]>()
    for (const item of payload.value) {
      if (!maisRecentePorBanco.has(item.InstituicaoFinanceira)) {
        maisRecentePorBanco.set(item.InstituicaoFinanceira, item)
      }
    }

    const agora = new Date().toISOString()
    const linhas = Array.from(maisRecentePorBanco.values()).map((item) => ({
      banco: item.InstituicaoFinanceira,
      data_referencia: `${item.anoMes}-01`,
      taxa_mes: item.TaxaJurosAoMes,
      taxa_ano: item.TaxaJurosAoAno,
      atualizado_em: agora,
    }))

    const { error } = await supabaseAdmin
      .from('taxas_financiamento_bancos')
      .upsert(linhas, { onConflict: 'banco,data_referencia' })

    if (error) throw error
    resultado.bancosGravados = linhas.length

    if (maisRecentePorBanco.size < BANCOS_ALVO.length) {
      resultado.erros.push(
        `bancos: só ${maisRecentePorBanco.size} de ${BANCOS_ALVO.length} bancos-alvo encontrados na resposta da Olinda — confira se os nomes em BANCOS_ALVO ainda batem com o InstituicaoFinanceira retornado pela API.`
      )
    }
  } catch (err: any) {
    console.error('Erro ao sincronizar taxas por banco:', err)
    resultado.erros.push(`bancos: ${err.message || String(err)}`)
  }

  const status = resultado.erros.length > 0 ? 207 : 200
  return new Response(JSON.stringify(resultado), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
