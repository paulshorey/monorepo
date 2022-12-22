import axios from "cachios";

export const get = async function (url: string, options: Record<string, any> = {}): Promise<any> {
  console.log(`\n\n\nfetcher_get() ${JSON.stringify([...arguments])}\n\n\n`);
  let data = await axios.get(url, options);
  if (data && data.data) {
    return data.data;
  } else {
    return { error: data };
  }
};

export const post = async function (url: string, options: Record<string, any> = {}): Promise<any> {
  let data = await axios.post(url, options);
  if (data && data.data) {
    return data.data;
  } else {
    return { error: data };
  }
};
