
const GOLDEN = Array(20).fill('test');
async function test() {
  for (let i = 0; i < GOLDEN.length; i++) {
    const res = await fetch('https://tiktok-apm-portfolio.vercel.app/api/evaluate', {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({claim: 'test claim'})
    });
    console.log(i, res.status, await res.text().catch(()=>''));
  }
}
test();

