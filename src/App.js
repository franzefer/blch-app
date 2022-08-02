import detectEthereumProvider from '@metamask/detect-provider'
import { useCallback, useEffect, useState } from 'react'
import { loadContract } from './utils/loadcontract'
import Web3 from 'web3'

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
    isProviderConnected: false,
  })
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [reload, setReload] = useState(false)
  const canConnectToContract = account && web3Api.contract
  const toggleReload = useCallback(() => setReload(!reload), [reload])

  const setAccountListener = (provider) => {
    const reloadEvents = ['accountsChanged', 'chainChanged']
    reloadEvents.forEach((event) =>
      provider.on(event, (_) => window.location.reload())
    )
  }

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider()
      if (provider) {
        setAccountListener(provider)
        const contract = await loadContract('Main', provider)
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderConnected: true,
        })
      } else {
        setWeb3Api({ ...web3Api, isProviderConnected: true })
        console.error("Couldn't find a web3 provider")
      }
    }
    loadProvider()
  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api
      const weiBalance = await web3.eth.getBalance(contract.address)
      const balance = web3.utils.fromWei(weiBalance, 'ether')
      setBalance(balance)
    }
    web3Api.contract && loadBalance()
  }, [web3Api, reload])

  useEffect(() => {
    const getAccounts = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
    }
    web3Api.web3 && getAccounts()
  }, [web3Api.web3])

  const addFunds = useCallback(async () => {
    const { contract } = web3Api
    await contract.send({
      from: account,
      value: web3Api.web3.utils.toWei('1', 'ether'),
    })
    toggleReload()
  }, [web3Api, account, toggleReload])

  const withdrawFunds = async () => {
    const { contract, web3 } = web3Api
    const withdrawAmount = web3.utils.toWei('0.1', 'ether')
    await contract.withdraw(withdrawAmount, { from: account })
    toggleReload()
  }

  return (
    <main className='hero is-fullheight is-dark'>
      <div className='hero-body columns is-centered'>
        <div className='column is-4'>
          {web3Api.isProviderConnected ? (
            <>
              <strong className='mr-2'>Account:</strong>
              {account ? (
                <span className='is-size-7'>{account}</span>
              ) : !web3Api.provider ? (
                <div className='notification is-warning is-size-7'>
                  Wallet is not detected{' '}
                  <a href='https://metamask.io'>install metamask</a>
                </div>
              ) : (
                <button
                  className='button is-small is-rounded is-light'
                  onClick={() => {
                    web3Api.provider.request({ method: 'eth_requestAccounts' })
                  }}
                >
                  Connect to account
                </button>
              )}
            </>
          ) : (
            <span>looking for web3...</span>
          )}
          <h1 className='is-size-3 my-4'>
            Current balance: <strong>{balance}</strong> ETH
          </h1>
          <div>
            <button
              disabled={!canConnectToContract}
              className='button is-primary is-fullwidth mb-1'
              onClick={addFunds}
            >
              Donate 1 eth
            </button>
            <button
              disabled={!canConnectToContract}
              className='button is-info is-fullwidth mb-1'
              onClick={withdrawFunds}
            >
              Withdraw 0.1 ether
            </button>
            {!canConnectToContract && <span>Can't connect to contract</span>}
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
