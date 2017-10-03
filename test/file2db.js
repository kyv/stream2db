/* eslint-env mocha */
const should = require('should');
const shortid = require('shortid');
const etl = require('etl');
const omit = require('lodash.omit');
const mainStream = require('../lib/parse');
const args = require('../lib/args');
const fPath = `${__dirname}/Contratos.csv`;
const fileStream = etl.file(fPath).pipe(etl.csv());
const calendarFields = ['PROC_F_PUBLICACION', 'FECHA_APERTURA_PROPOSICIONES', 'FECHA_INICIO', 'FECHA_FIN', 'FECHA_CELEBRACION'];
const KNOWN_BOOLS = ['CONVENIO_MODIFICATORIO', 'CONTRATO_MARCO', 'COMPRA_CONSOLIDADA', 'PLURIANUAL'];

Object.assign(args, {
  backend: 'mongo',
  uris: [fPath],
  type: 'test',
});

let DBString = `localhost/TEST${shortid.generate()}`;

if (args.hasOwnProperty('href')) {
  DBString = args.href;
}

const db = require('monk')(DBString);
const collection = db.get(args.type, { castIds: false });

fileStream.on('error', error => {
  throw error;
});
fileStream.pause();

describe('stream from file to DB', () => {

  before(done => {
    db.then(x => {
      mainStream(fileStream, omit(args, 'sources'), x)
        .promise()
        .then(() => {
          done();
        }, e => process.stdout.write('error', e));
    });

  });

  after(done => {
    collection.drop(() => (done()));
  });

  it('should parse and insert 3 documents', done => {

    collection.find({}).then(docs => {
      const count = docs.length;
      const gobs = docs.map(o => (o.GOBIERNO));

      should(count).eql(3);
      should(gobs).eql(['APF', 'APF', 'APF']);
      done();
    });
  });

  it('does types', done => {

    collection.find({}, { limit: 1 }).then(docs => {
      const contract = docs[0];

      for (let i = 0; i++; i < calendarFields.length) {
        contract[calendarFields[i]].should.be.an.instanceof(Date);
      }

      for (let i = 0; i++; i < KNOWN_BOOLS.length) {
        contract[KNOWN_BOOLS[i]].should.be.an.instanceof(Boolean);
      }

      done();
    });
  });
});
