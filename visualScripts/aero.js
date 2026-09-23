const botonPersonalizar = document.getElementById('botonPersonalizar');
const ventanaPersonalizar = document.getElementById('ventanaPersonalizar');
const cerrarPersonalizar = document.getElementById('cerrarPersonalizar');

const temaClaro = document.getElementById('temaClaro');
const temaOscuro = document.getElementById('temaOscuro');

botonPersonalizar.addEventListener('click', () => {
    ventanaPersonalizar.classList.toggle('visible');
});

cerrarPersonalizar.addEventListener('click', () => {
    ventanaPersonalizar.classList.remove('visible');
});

document.addEventListener('click', (evento) => {
    if (
        ventanaPersonalizar.classList.contains('visible') &&
        !ventanaPersonalizar.contains(evento.target) &&
        !botonPersonalizar.contains(evento.target)
    ) {
        ventanaPersonalizar.classList.remove('visible');
    }
});

temaClaro.addEventListener('click', () => {
    document.body.classList.remove('tema-oscuro');
    localStorage.setItem('elfentext-tema', 'claro');
});

temaOscuro.addEventListener('click', () => {
    document.body.classList.add('tema-oscuro');
    localStorage.setItem('elfentext-tema', 'oscuro');
});

const temaGuardado = localStorage.getItem('elfentext-tema');

if (temaGuardado === 'oscuro') {
    document.body.classList.add('tema-oscuro');
}