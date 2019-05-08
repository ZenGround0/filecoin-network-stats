export enum Network {
  STABLE = 'stable',
  OLD_STABLE_2 = 'old-stable-2',
  OLD_STABLE_1 = 'old-stable-1',
  CUSTOM = 'custom'
}

const URLS = {
  [Network.STABLE]: process.env.BACKEND_URL,
  [Network.OLD_STABLE_2]: 'https://prod-devnet-1.filecoin-stats-infra.kyokan.io',
  [Network.OLD_STABLE_1]: 'https://prod-devnet-2.filecoin-stats-infra.kyokan.io'
};

function urlFor (network: Network, customURL: string) {
  if (network === Network.CUSTOM) {
    return customURL;
  }

  return URLS[network];
}

export async function getJSON<T> (url: string): Promise<T> {
  const res = await fetch(url);
  if (res.status !== 200) {
    throw new Error(`Received non-200 status code: ${res.status}`);
  }

  const json = await res.json();
  return json as T;
}

export async function getBackendJSON<T> (network: Network, customURL: string, path: string): Promise<T> {
  return getJSON(`${urlFor(network, customURL)}/${path}`);
}