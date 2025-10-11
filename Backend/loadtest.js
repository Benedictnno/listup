import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // ramp up to 50 users
    { duration: '1m', target: 50 },  // stay for 1 minute
    { duration: '20s', target: 0 },  // ramp down
  ],
};

export default function () {
  http.get('http://localhost:4000/api/listings');
  sleep(1);
}
