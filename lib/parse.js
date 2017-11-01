const hash = require('object-hash');
const filter = require('through2-filter').obj;
const etl = require('etl');
const valueMap = require('./util').valueMap;
const seenHashes = [];

// let count = 0;
// let dissmissed = 0;

function configureBackend(args, db) {
  const insertOptions = {
    concurrency: 10,
    pushResults: true,
  };

  if (args.backend === 'mongo') {
    const collection = db.get(args.type, { castIds: false });

    return etl.mongo.insert(collection, insertOptions);
  }
  return etl.elastic.index(db, args.db, args.type, insertOptions);
}

function mainStream(stream, args, db) {
  const cmd = configureBackend(args, db);

  return stream
    .on('error', error => {
      throw error;
    })
    .on('error', error => {
      throw error;
    })
    .pipe(etl.map(data => {
      const body = valueMap(data.body);

      // new Objects will be inserted
      // recurring Objectss will overwrite previous
      // with same _id
      if (args.hasOwnProperty('id') && args.id === 'hash') {
        return Object.assign(body, {
          _id: data.hash,
        });
      }
      if (args.hasOwnProperty('id')) {
        return Object.assign(body, {
          _id: data[args.id],
        });
      }
      data.body = body;
      return data;
    }))
    .on('error', error => {
      throw error;
    })
    .pipe(etl.map(data => {
      if (args.converter) {
        const converter = require(`../converters/${args.converter}`);
        const release = converter(data);

        return release
      }
      return data;
    }))
    .on('error', error => {
      throw error;
    })
    .pipe(etl.collect(250))
    .on('error', error => {
      throw new Error(error);
    })
    .pipe(cmd)
    .on('error', error => {
      throw error;
    });
}

module.exports = mainStream;
