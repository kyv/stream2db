/* eslint no-console: ["error", { allow: ["time", "timeEnd"] }] */
const DBURI = process.env.MONGODB_URI;
const db = require('monk')(DBURI);
const Release = require('cnet2ocds');
const compranet = db.get('compranet', {
  castIds: false,
});
const ocds = db.get('ocds', {
  castIds: false,
});
const ProgressBar = require('progress');
const date = new Date();

const indexes = Promise.all([
  compranet.createIndex('body.NUMERO_PROCEDIMIENTO'),
  ocds.createIndex('ocid'),
]);

function nP2Ocid(string) {
  // NUMERO_PROCEDIMIENTO to OCID
  return `OCDS-0UD2Q6-${string}`;
}

function ocdsUpdater(first, last) {
  // FIXME may be other info available in some docs but
  // not others. for example `buyer` object
  return {
    $addToSet: {
      source: { $each: last.source },
      parties: { $each: last.parties },
      awards: { $each: last.awards },
      contracts: { $each: last.contracts },
    },
  };
}

db.then(() => {
  process.stdout.write(`Connected to mongodb server @${date}\n`);
  return ocds.remove({});
}).then(result => {
  process.stdout.write(`removed ${result.result.n} documents from ocds\n`);
  return indexes;
}).then(() => {
  process.stdout.write('indexes built\n');
  return compranet.count({
    'body.NUMERO_PROCEDIMIENTO': { $exists: true, $ne: null },
  });
}).then(docCount => {
  process.stdout.write(`${docCount} Documents\n`);
  const bar = new ProgressBar('[:bar] :percent :etas', {
    total: docCount,
  });

  console.time('duration');

  return compranet.find({
    'body.NUMERO_PROCEDIMIENTO': { $exists: true, $ne: null },
  }).each(doc => {
    const release = new Release({ cnetDocument: doc.body }).release;
    const OCID = nP2Ocid(doc.body.NUMERO_PROCEDIMIENTO);

    ocds.findOne({ ocid: OCID })
      .then(ocdsDoc => {
        bar.tick();
        if (ocdsDoc && ocdsDoc.ocid) {
          // if PROCESS already exists, modify it
          const modifier = ocdsUpdater(ocdsDoc, release);

          return ocds.update({ ocid: OCID }, modifier)
            .then(() => {
              // FIXME instead of remove, remove all the data
              // but the hash so we don't reimprt the same Documents
              // on the next run. Since we are filtering by NUMERO_PROCEDIMIENTO,
              // those `just hash docs` won't get touched in the future
              compranet.update({ _id: doc._id }, { _id: doc.hash }).then(res => {
                console.log(res);
              });
              --docCount;
              if (docCount === 0) {
                console.timeEnd('duration');
                db.close();
              }
            });
        }
        // if new process, insert
        return ocds.insert(release).then(() => {
          compranet.update({ _id: doc._id }, { _id: doc.hash }).then(res => {
            console.log(res);
          });
          --docCount;
          if (docCount === 0) {
            console.timeEnd('duration');
            db.close();
          }
        });
      });
  });
});
