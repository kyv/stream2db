#!/usr/bin/env bash

BACKEND=mongo
PROXY_URL="https://excel2json.herokuapp.com"

URLS=(
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2018.zip
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2017.zip
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2016.zip
  https://upcp.funcionpublica.gob.mx/descargas/Contratos2015.zip
)

# randomize list to increase likely hood of importing new documents on reruns
IFS=$'\n' SORTED_URLS=($(shuf <<<"${URLS[*]}"))
unset IFS

for url in "${SORTED_URLS[@]}";
do
  printf "streaming ${PROXY_URL}/${url} to ${BACKEND}\n"
  stream2db --backend ${BACKEND} \
    --id hash \
    --type compranet \
    ${PROXY_URL}/${url}
done
