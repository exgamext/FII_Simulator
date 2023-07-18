$(".money").maskMoney(
  {
    prefix:'R$ ', 
    allowNegative: false, 
    thousands:'.', 
    decimal:',',
    affixesStay: true
  }
);

$(".yeld").maskMoney(
  {
    suffix:'%',
    allowNegative: true, 
    thousands:'.', 
    decimal:',',
    affixesStay: true
  }
);

function onLoad() {
  document.querySelectorAll("input").forEach(input => {
    input.value = ""
  })
  document.querySelectorAll("select").forEach(select => {
    select.value = "month"
  })
  document.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
    checkbox.checked = false
  })
}

// Função mestre da simulação
function Simulate() {
  // Imports
  let FII_Name = $("#FII_Name").val() // Nome do FII
  let FII_Price = $("#FII_Price").maskMoney('unmasked')[0] // Preço de compra da cota
  let FII_LastDiv = $("#FII_LastDiv").maskMoney('unmasked')[0] // Valor do último dividendo pago
  let FII_Yield = $("#FII_Yield").maskMoney('unmasked')[0] // Porcentagem de Dividend Yield
  let FII_Initial = $("#FII_Initial").maskMoney('unmasked')[0] // Investimento Inicial
  let FII_Month = $("#FII_Month").maskMoney('unmasked')[0] // Investimento Mensal
  let FII_Time = $("#FII_Time").val() // Tempo de investimento em meses ou anos
  let FII_TimeType = $("#FII_TimeType").val() // Define se o tempo de investimento está em meses ou anos

  // Transform year in month
  if (FII_Time == 0) {
    $('#R_Time').html(`Nenhum tempo definido!`)
  } else if (FII_TimeType == "year") {
    $('#R_Time').html(`${FII_Time} anos`)
    FII_Time = FII_Time * 12
  } else if (FII_TimeType == "month") {
    $('#R_Time').html(`${FII_Time} meses`)
    FII_Time = FII_Time
  }
  

  // Set resume title
  $("#R_FII_Name").html(`${FII_Name.toUpperCase()} | R$ ${FII_Price} | R$ ${FII_LastDiv} | DY ${FII_Yield}%`)

  // Details
  // const resultado = calcularInvestimentoFII(10.66, 0.12, 12.41, 500, 500, 12)
  const resultado = calcularInvestimentoFII(FII_Price, FII_LastDiv, FII_Yield, FII_Initial, FII_Month, FII_Time)

  // Resume
  $('#R_TotalResult').html(resultado.FII_Patt)
  $('#R_TotalInvest').html(resultado.FII_Invest)
  $('#R_TotalReInv').html(resultado.FII_ReInvTotal)
  $('#R_TotalDiv').html(resultado.FII_DivTotal)
  $('#R_Cotas').html(resultado.FII_Cota)
  $('#R_Initial').html(formatarMoeda(FII_Initial))
  $('#R_Month').html(formatarMoeda(FII_Month))

  $('#resume_short').addClass('active');
  $('#simulation_card').removeClass('active');
}

// Função para converter o valores para moeda
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Função para calcular o investimento de FII
function calcularInvestimentoFII(FII_Price, FII_LastDiv, FII_Yield, FII_Initial, FII_Month, FII_Time) {
  let FII_Cota = 0 // Quantidade total de cotas adquiridas
  let FII_Invest = FII_Initial // Valor total de investimento via aporte
  let FII_DivMes = 0 // Valor total ganho em dividendos no mês atual
  let FII_DivTotal = 0 // Valor total ganho em dividendos no período de investimento
  let FII_ReInv = 0 // Valor total reinvestido
  FII_ReInvTotal = 0 // Valor total reinvestido no período de investimento

  let resultHtml = ''

  for (let i = 0; i < FII_Time; i++) {
    let investimentoMensal = (i === 0) ? FII_Initial : FII_Month
    let reinvestir = document.querySelector('#FII_ReInvest').checked

    let FII_CotaMes = 0 // Quantidade de cotas adquiridas no mês atual

    if (i === 0) {
      FII_CotaMes = Math.floor(FII_Initial / FII_Price)
      FII_Cota = FII_CotaMes
      FII_DivMes = FII_Cota * FII_LastDiv

      let FII_Rest = FII_Initial % FII_Price
      FII_ReInv = FII_Rest
    } else {
      if (reinvestir) {
        investimentoMensal += FII_ReInv + FII_DivMes
        FII_ReInvTotal += FII_ReInv
      } else {
        FII_ReInv = 0; // Define o valor restante como zero se não houver reinvestimento
      }

      FII_CotaMes = Math.floor(investimentoMensal / FII_Price)
      let FII_Rest = investimentoMensal % FII_Price

      FII_Cota += FII_CotaMes
      FII_ReInv = FII_Rest
      FII_DivMes = FII_Cota * FII_LastDiv
      FII_DivTotal += FII_DivMes
    }

    resultHtml += `
    <tr>
      <td>${i + 1}</td>
      <td>${formatarMoeda(investimentoMensal)}</td>
      <td>${FII_CotaMes}</td>
      <td>${FII_Cota}</td>
      <td>${formatarMoeda(FII_ReInv)}</td>
      <td>${formatarMoeda(FII_DivMes)}</td>
    </tr>
    `;

    if (i === 0) {
      FII_Invest = FII_Month // Atualizar o valor total de investimento para o investimento mensal a partir do segundo mês
    }
  }

  const resultDiv = document.querySelector('.resultData')
  resultDiv.innerHTML = resultHtml

  // Calculo de patrimônio
  FII_Patt = formatarMoeda(FII_Cota * FII_Price + FII_ReInv + FII_DivTotal)
  FII_Invest = formatarMoeda(FII_Initial + (FII_Month * (FII_Time - 1)))
  FII_DivTotal = formatarMoeda(FII_DivTotal)

  if (FII_ReInvTotal == 0) {
    FII_ReInvTotal = 'Nenhum valor reinvestido!'
  } else {
    FII_ReInvTotal = formatarMoeda(FII_ReInvTotal)
  }


  return {
    FII_Cota, // Quantidade total de cotas adquiridas
    FII_Patt, // Património total em cotas e restante e dividendos
    FII_Invest, // Valor total de investimento via aporte
    FII_DivTotal, // Valor total ganho em dividendos no período de investimento
    FII_ReInvTotal // Valor total reinvestido
  }
}

function NewSimulation() {
  window.location.reload()
}

function MoreDetails() {
  if (/Android|iPhone/i.test(navigator.userAgent)) {
    alert("Essa função ainda não suporta dispositivos móveis!")
  } else {
    $('#resume_detail').addClass('active');
  }
}