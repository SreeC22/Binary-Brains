import React, { useEffect, useState } from 'react';

function Greeting() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8080/greet')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <p>{message}</p>
    </div>
  );
}

export default Greeting;
