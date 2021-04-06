/* eslint-disable no-shadow */
const fs = require('fs')
const test = require('tape')
const { InputDataDecoder, decodeInput } = require('../src/alexDecoder')

test('decoder', (t) => {
  // Testing how decoders can be passed in to simulate Liam's ethereum-input-to-object
  t.test('Test multiple ways to create decoder', (t) => {
    t.plan(2)
    const data = fs.readFileSync(`${__dirname}/data/Uniswap_v2_router_2_input.txt`, 'utf8')
    // 1: test with premade decoder class
    const decoder1 = new InputDataDecoder(`${__dirname}/data/Uniswap_v2_router_2_abi.json`)
    // 2: test with abi object
    const decoder2 = JSON.parse(fs.readFileSync(`${__dirname}/data/Uniswap_v2_router_2_abi.json`, 'utf8'))
    const result1 = decodeInput(decoder1, data)
    const result2 = decodeInput(decoder2, data)
    const expectedSwapExactETHForTokens = {
      methodName: 'swapExactETHForTokens',
      params: {
        amountOutMin: '33674617150280629752981',
        path: [
          '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          '0x04969cD041C0cafB6AC462Bd65B536A5bDB3A670',
        ],
        to: '0x8f5550De7D7F47cf0128592fC4A50B6925d65a0F',
        deadline: '1617249277',
      },
    }
    t.deepEquals(result1, expectedSwapExactETHForTokens)
    t.deepEquals(result2, expectedSwapExactETHForTokens)
  })

  // Common case of Uniswap v2 Router 2
  // https://etherscan.io/tx/0x46ebd2ab9df32298b791ef54b9a82bf64c13d23c839998351a97a9663a79e7dd
  t.test('Checking Uniswap v2 Router 2', (t) => {
    t.plan(1)
    const decoder = new InputDataDecoder(`${__dirname}/data/Uniswap_v2_router_2_abi.json`)
    const data = fs.readFileSync(`${__dirname}/data/Uniswap_v2_router_2_input.txt`, 'utf8')
    const result = decoder.decodeData(data)
    const expectedSwapExactETHForTokens = {
      methodName: 'swapExactETHForTokens',
      params: {
        amountOutMin: '33674617150280629752981',
        path: [
          '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          '0x04969cD041C0cafB6AC462Bd65B536A5bDB3A670',
        ],
        to: '0x8f5550De7D7F47cf0128592fC4A50B6925d65a0F',
        deadline: '1617249277',
      },
    }
    t.deepEquals(result, expectedSwapExactETHForTokens)
  })

  // Normal unoswap tx, has a bytes32[] array we want to ensure does not double decode
  t.test('Checking 1inch v3 unoswap for bytes32[] type', (t) => {
    t.plan(1)
    const decoder = new InputDataDecoder(`${__dirname}/data/1inch_exchange_v3_abi.json`)
    const data = fs.readFileSync(`${__dirname}/data/1inch_exchange_v3_unoswap.txt`, 'utf8')
    const result = decoder.decodeData(data)
    const expectedUnoswap = {
      methodName: 'unoswap',
      params: {
        srcToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        amount: '55075286902',
        minReturn: '5200361379387703126290',
        '': [
          '0x80000000000000003b6d03400d4a11d5eeaac28ec3f61d100daf4d40471f1852',
          '0x00000000000000003b6d034018a797c7c70c1bf22fdee1c09062aba709cacf04'],
      },
    }
    t.deepEquals(result, expectedUnoswap)
  })

  // Normal unoswap tx, has a bytes32[] array we want to ensure does not double decode
  // https://etherscan.io/tx/0x00944fe630889d963409268d2674203cff5e7a50d20f4fb6b175af9b6309d112
  t.test('Checking 1inch v3 unoswap for bytes32[] type - PART 2', (t) => {
    t.plan(1)

    const decoder = new InputDataDecoder(`${__dirname}/data/1inch_exchange_v3_abi.json`)
    const data = fs.readFileSync(`${__dirname}/data/1inch_exchange_v3_unoswap_2.txt`, 'utf8')
    const result = decoder.decodeData(data)
    const expectedUnoswap = {
      methodName: 'unoswap',
      params: {
        srcToken: '0x4fE83213D56308330EC302a8BD641f1d0113A4Cc',
        amount: '7205316239574000446388',
        minReturn: '597064711551968836389',
        '': [
          '0x00000000000000003b6d034004444d365324134e58104b1d874d00dc68dcea53',
          '0x80000000000000003b6d0340d84d55532b231dbb305908bc5a10b8c55ba21e5e',
        ],
      },
    }
    t.deepEquals(result, expectedUnoswap)
  })

  // This used to have trouble decoding, Eth Asset, WETH in the internals
  // The important part is that the data which is type 'bytes' isn't double decoded
  // https://etherscan.io/tx/0x3693b42398beaf1e367cfe004b6606697764bc99ab1d5c01c300b760034be46c
  t.test('Checking 1inch v2 swap for bytes type', (t) => {
    t.plan(1)
    const decoder = new InputDataDecoder(`${__dirname}/data/1inch_exchange_v2_abi.json`)

    const data = fs.readFileSync(`${__dirname}/data/1inch_exchange_v2_assetEth_withWeth.txt`, 'utf8')
    const result = decoder.decodeData(data)
    const expectedSwap = fs.readFileSync(`${__dirname}/data/1inch_v2_expectedSwap.json`)
    // Ensure v2 swap calls are not double decoding data
    t.deepEquals(result, JSON.parse(expectedSwap))
  })

  // A tricky one since Etherscan provides the wrong abi
  // This abi will give warnings of duplicate definitions
  t.test('checking Compound: Comptroller', (t) => {
    t.plan(1)
    const decoder = new InputDataDecoder(`${__dirname}/data/Comptroller_abi.json`)
    const data = fs.readFileSync(`${__dirname}/data/Compound_Comptroller_input.txt`, 'utf8')
    const result = decoder.decodeData(data)
    const expectedClaimComp = {
      methodName: 'claimComp',
      params: {
        holder: '0xFFe5347961a41778Df7f930B49F61b20a4b82a9e',
        cTokens: [
          '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
        ],
      },
    }
    t.deepEquals(result, expectedClaimComp)
  })

  // https://etherscan.io/tx/0xbc2530efe613b4c061ea6757e2a7180973718f1d760c029840cfd531fde4c386
  // This isn't yet decoded by etherscan B-)
  t.test('Checking Balancer: Exchange Proxy 2', (t) => {
    t.plan(1)
    const decoder = new InputDataDecoder(`${__dirname}/data/Balancer_Exchange_Proxy_2_abi.json`)
    const data = fs.readFileSync(`${__dirname}/data/Balancer_Exchange_Proxy_2_input.txt`, 'utf8')
    const result = decoder.decodeData(data, 'jsObject')
    const expectedMultihopBatchSwapExactIn = {
      methodName: 'multihopBatchSwapExactIn',
      params: {
        swapSequences: [
          [
            {
              pool: '0xC697051d1C6296C24aE3bceF39acA743861D9A81',
              tokenIn: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
              tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
              swapAmount: '31670863740000000000',
              limitReturnAmount: '0',
              maxPrice: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
            },
            {
              pool: '0x4bcbc51fbaBe5Ed04b4cD93d361674fC3fb519b8',
              tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
              tokenOut: '0x5B09A0371C1DA44A8E24D36Bf5DEb1141a84d875',
              swapAmount: '6275739454135587377',
              limitReturnAmount: '0',
              maxPrice: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
            },
          ],
        ],
        tokenIn: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        tokenOut: '0x5B09A0371C1DA44A8E24D36Bf5DEb1141a84d875',
        totalAmountIn: '31670863740000000000',
        minTotalAmountOut: '39597173304477611940298',
      },
    }
    t.deepEquals(result, expectedMultihopBatchSwapExactIn)
  })

  // batchFillOrders which has a bytes[] type, to check we are not double decoding
  t.test('Checking 0x_v3 for bytes[] type', (t) => {
    t.plan(1)
    const decoder = new InputDataDecoder(`${__dirname}/data/0x_v3_abi.json`)
    const data = fs.readFileSync(`${__dirname}/data/0x_v3_batchFillOrders.txt`, 'utf8')
    const result = decoder.decodeData(data)
    const expectedBatchFillOrders = {
      methodName: 'batchFillOrders',
      params: {
        orders: [{
          makerAddress: '0x75ea4d5a32370f974D40b404E4cE0E00C1554979',
          takerAddress: '0x0000000000000000000000000000000000000000',
          feeRecipientAddress: '0x1000000000000000000000000000000000000011',
          senderAddress: '0x0000000000000000000000000000000000000000',
          makerAssetAmount: '7808845788',
          takerAssetAmount: '1218396496',
          makerFee: '0',
          takerFee: '0',
          expirationTimeSeconds: '1610851745',
          salt: '935753695886941056',
          makerAssetData: '0xf47261b000000000000000000000000077d7e314f82e49a4faff5cc1d2ed0bc7a7c1b1f0',
          takerAssetData: '0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          makerFeeAssetData: '0x',
          takerFeeAssetData: '0x',
        }],
        takerAssetFillAmounts: ['15602774'],
        signatures: ['0x1b54c660e791da4c5d11f5f82993040ffc11d68c81364312eca3729ebb97fcaea731b7ec5121978e80a3f88c9134687c3d1a551414b11e0d75ab8919ef15759e3d02'],
      },
    }
    t.deepEquals(result, expectedBatchFillOrders)
  })
})
