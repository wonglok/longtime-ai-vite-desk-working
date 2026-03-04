
  process.on('message', async (msg) => {
    console.log('Child received:', msg);

    abc

    process.send(await exec());
  });
