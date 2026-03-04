#!/bin/bash


# 本を追加
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"id":"1","title":"Clean Code","isbn":"9784048860000"}'

# 積読→読中
curl -X PATCH http://localhost:3000/api/books/1/start

# 読中→読了（評価あり）
curl -X PATCH http://localhost:3000/api/books/1/complete \
  -H "Content-Type: application/json" \
  -d '{"rating":5}'

# 読了確認
curl http://localhost:3000/api/books

# 本を削除
curl -X DELETE http://localhost:3000/api/books/1

# 削除後確認（空配列）
curl http://localhost:3000/api/books

# 存在しない本へのアクセス
curl -X PATCH http://localhost:3000/api/books/not-exist/start
# {"error":"Book not found: not-exist"} 404
