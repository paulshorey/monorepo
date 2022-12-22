import axios from 'axios';

export default async function handler(req, res) {
  try {
    let response = await axios.get(`https://api.vercel.com/v1/integrations/deploy/prj_22tPvKZoGnxVwP2I7ojWdxnDvAV9/id9yUn9aDy`);
    let data = response.data;
    // console.log('\n\ndata\n', data, '\n\n');
    res.status(200).json(data);
    // {data: {}}
  } catch (e) {
    res.status(200).json({ error: e });
    // {error: {}}
  }
}


