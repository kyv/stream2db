#!/bin/bash

# MONGO_HOST=
# MONGO_COLLECTION=
BACKEND=mongo
TIMESTAMP=$(date "+%s")
# DATABASE="compranet-${TIMESTAMP}"
DATABASE="compranet-intermediary"
PROXY_URL="https://excel2json.herokuapp.com"
URLS=(
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2017.zip
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2016.zip
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2015.zip
  https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2014.zip
  https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2013.zip
  https://compranetinfo.funcionpublica.gob.mx/descargas/cnet/Contratos2010_2012.zip
)

for url in "${URLS[@]}";
do
  echo "streaming ${PROXY_URL}/${url} to ${BACKEND}"
  stream2db --backend ${BACKEND} \
    --id hash \
    --db ${DATABASE} \
    --type compranet \
    ${PROXY_URL}/${url}
done

# TODO script to loop over compranet docs
# 1. aggregation
# group contracts by num_proced and process from there
# or
# 2. loop over all num_proced
