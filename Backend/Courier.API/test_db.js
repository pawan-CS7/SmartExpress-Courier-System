fetch("http://localhost:5144/api/Auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@gmail.com", password: "password123" })
})
.then(res => res.json())
.then(data => {
  return fetch("http://localhost:5144/api/Orders", {
    headers: { "Authorization": `Bearer ${data.token}` }
  });
})
.then(res => res.json())
.then(data => {
  console.log(JSON.stringify(data.slice(0, 5), null, 2));
})
.catch(console.error);
