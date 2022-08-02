import contract from '@truffle/contract'

export const loadContract = async (name, provider) => {
  const res = await fetch('/contracts/' + name + '.json')
  const abi = await res.json()

  const _contract = contract(abi)
  _contract.setProvider(provider)

  let deployedContract = null

  try {
    deployedContract = await _contract.deployed()
  } catch {
    console.error('Could not load contract')
  }

  return deployedContract
}
