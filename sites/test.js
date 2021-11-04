const axios = require('axios')
const fs = require('fs')

exports.execute = async () => {
  const rawsite = await axios.get("nope", {
    withCredentials: true,
    timeout: 10000,
    headers: {'X-Requested-With': 'XMLHttpRequest', Cookie: "nw=1;"}
  })

  fs.writeFileSync('rawmain.txt', rawsite.data);
}