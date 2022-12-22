import axios from 'axios';

export default async function handler(req, res) {
  try {
    let limit = 200;
    let response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=${limit}&CMC_PRO_API_KEY=117e0c2a-8f96-4559-886c-5e988d3cba3b`);
    let data = response.data;
    // console.log('\n\ndata\n', data, '\n\n');
    res.status(200).json(data);
    // {data: {}}
  } catch (e) {
    res.status(200).json({ error: e });
    // {error: {}}
  }
}


