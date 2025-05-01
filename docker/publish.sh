docker build -t techfinance-backend .
docker tag techfinance-backend:latest gabrielalmir/techfinance-backend:latest
docker push gabrielalmir/techfinance-backend:latest
