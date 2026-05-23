#!/bin/bash
cd /Users/shahtanzeel/Desktop/KRYO/Asset-Manager/artifacts/api-server
export PORT=3000
export JWT_SECRET=kryo-secret-2026
export DATABASE_URL='postgresql://neondb_owner:npg_ka2B4duHKsnN@ep-little-rice-aobj6w2x-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
node --enable-source-maps ./dist/index.mjs
