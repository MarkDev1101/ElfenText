const botonPersonalizar = document.getElementById('botonPersonalizar');
const ventanaPersonalizar = document.getElementById('ventanaPersonalizar');
const cerrarPersonalizar = document.getElementById('cerrarPersonalizar');

botonPersonalizar.addEventListener('click', () => {
    ventanaPersonalizar.classList.toggle('visible');
});

cerrarPersonalizar.addEventListener('click', () => {
    ventanaPersonalizar.classList.remove('visible');
});