const usuarios = {}; // Objeto para almacenar usuarios

// Mostrar el modal de autenticación al hacer clic en el ícono
document.getElementById('loginIcon').addEventListener('click', function() {
    document.getElementById('authModal').style.display = 'flex';
});

// Cerrar el modal al hacer clic fuera del contenido
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Función para mostrar el formulario de registro
function mostrarRegistro() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

// Función para volver al formulario de inicio de sesión
function volverLogin() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Función para iniciar sesión
function iniciarSesion() {
    const usuario = document.getElementById('usuarioLogin').value.trim();
    const contrasena = document.getElementById('contrasenaLogin').value.trim();

    // Cargar usuarios desde localStorage
    const usuariosStorage = JSON.parse(localStorage.getItem('usuarios')) || {};

    if (usuariosStorage[usuario] && usuariosStorage[usuario].contrasena === contrasena) {
        alert('Inicio de sesión exitoso');
        document.getElementById('authModal').style.display = 'none';
        actualizarEstadoDashboard();
        cargarRecorridos();
        mostrarSeccion('cards-container'); // Mostrar la pantalla principal
    } else {
        alert('Error en el inicio de sesión: Usuario o contraseña incorrectos.');
    }
}

// Función para registrar un nuevo usuario
function registrarUsuario() {
    const usuario = document.getElementById('usuarioRegistro').value.trim();
    const correo = document.getElementById('correoRegistro').value.trim();
    const contrasena = document.getElementById('contrasenaRegistro').value.trim();
    const confirmaContrasena = document.getElementById('confirmaContrasena').value.trim();

    if (!usuario || !correo || !contrasena || !confirmaContrasena) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    if (contrasena !== confirmaContrasena) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    // Cargar usuarios desde localStorage
    const usuariosStorage = JSON.parse(localStorage.getItem('usuarios')) || {};

    if (usuariosStorage[usuario]) {
        alert('El usuario ya existe. Elige otro nombre de usuario.');
        return;
    }

    usuariosStorage[usuario] = { correo, contrasena };
    localStorage.setItem('usuarios', JSON.stringify(usuariosStorage));
    alert('Registro exitoso');
    volverLogin();
}

// Función para cerrar sesión (reiniciar estados)
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        alert('Has cerrado sesión.');
        // Limpiar estados
        document.getElementById('estadoVehiculo').innerText = 'Desconectado';
        document.getElementById('estadoBateria').innerText = '0%';
        document.getElementById('estadoCarga').innerText = '0%';
        document.getElementById('consumoEnergia').innerText = '0 kWh/100 km';
        document.getElementById('consumoChart').style.display = 'none';
        document.getElementById('routesList').innerHTML = '<p>No hay recorridos guardados.</p>';
        document.getElementById('tipsList').innerHTML = `
            <ul>
                <li>Mantén una velocidad constante para optimizar el consumo de energía.</li>
                <li>Revisa regularmente la presión de los neumáticos.</li>
                <li>Utiliza el modo de regeneración de energía durante el frenado.</li>
            </ul>
        `;
        mostrarSeccion('cards-container'); // Mostrar la pantalla principal
    }
}

// Función para mostrar estaciones de carga en Google Maps
function mostrarEstacionesCarga() {
    mostrarSeccion('mapSection');
}

// Función para mostrar alerta de mantenimiento
function mostrarMantenimiento() {
    const marcaModelo = obtenerMarcaModelo();
    const alertBox = document.getElementById('alertBox');

    if (marcaModelo) {
        // Simulación de alerta
        alertBox.innerHTML = `<p>Se recomienda un mantenimiento preventivo para tu ${marcaModelo} dentro de 500 km.</p>`;
    } else {
        alertBox.innerHTML = `<p>No hay alertas de mantenimiento pendientes.</p>`;
    }

    mostrarSeccion('maintenanceSection');
}

// Función para mostrar el estado de carga
function mostrarCarga() {
    const cargaActual = obtenerCarga(); // Función simulada para obtener carga
    // Mostrar el estado de carga
    document.getElementById('estadoCarga').innerText = `Carga actual de la batería: ${cargaActual}%`;
    mostrarSeccion('chargeSection');
}

// Función para mostrar el consumo de energía
function mostrarConsumoEnergia() {
    const consumo = obtenerConsumo(); // Función simulada para obtener consumo
    const ctx = document.getElementById('consumoChart').getContext('2d');

    // Limpiar el gráfico anterior si existe
    if (window.consumoChartInstance) {
        window.consumoChartInstance.destroy();
    }

    // Crear el gráfico
    window.consumoChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Consumo de Energía (kWh/100km)',
                data: [consumo, consumo + 2, consumo - 1, consumo + 3, consumo, consumo - 2],
                backgroundColor: 'rgba(30, 144, 255, 0.7)', // Dodger Blue
                borderColor: 'rgba(30, 144, 255, 1)', // Dodger Blue
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#2F4F4F' // Dark Slate Gray
                    }
                },
                x: {
                    ticks: {
                        color: '#2F4F4F' // Dark Slate Gray
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#2F4F4F' // Dark Slate Gray
                    }
                }
            }
        }
    });

    mostrarSeccion('energySection');
}

// Función para mostrar recorridos guardados
function mostrarRecorridos() {
    cargarRecorridos();
    mostrarSeccion('routesSection');
}

// Función para cargar recorridos desde localStorage
function cargarRecorridos() {
    const routesList = document.getElementById('routesList');
    const recorridos = JSON.parse(localStorage.getItem('recorridos')) || [];

    if (recorridos.length === 0) {
        routesList.innerHTML = '<p>No hay recorridos guardados.</p>';
    } else {
        let html = '<ul>';
        recorridos.forEach((recorrido, index) => {
            html += `<li>Recorrido ${index + 1}: ${recorrido.distancia} km - ${recorrido.duracion} min - ${recorrido.fecha}</li>`;
        });
        html += '</ul>';
        routesList.innerHTML = html;
    }
}

// Función para guardar un nuevo recorrido
function guardarRecorrido(distancia, duracion) {
    const recorridos = JSON.parse(localStorage.getItem('recorridos')) || [];
    const fecha = new Date().toLocaleDateString();
    recorridos.push({ distancia, duracion, fecha });
    localStorage.setItem('recorridos', JSON.stringify(recorridos));
    cargarRecorridos();
}

// Función para mostrar consejos de eficiencia
function mostrarConsejos() {
    mostrarSeccion('tipsSection');
}

// Función para mostrar una sección específica
function mostrarSeccion(seccionId) {
    const secciones = document.querySelectorAll('main > section');
    secciones.forEach(seccion => {
        if (seccion.id === seccionId) {
            seccion.classList.remove('hidden');
        } else {
            seccion.classList.add('hidden');
        }
    });
}

// Función para actualizar el estado en el dashboard
function actualizarEstadoDashboard() {
    // Simulación de datos en tiempo real
    const estadoVehiculo = "Conectado";
    const estadoBateria = "80%";

    document.getElementById('estadoVehiculo').innerText = estadoVehiculo;
    document.getElementById('estadoBateria').innerText = estadoBateria;
}

// Funciones simuladas para obtener datos (puedes reemplazarlas con lógica real)
function obtenerCarga() {
    return 80; // Carga simulada
}

function obtenerConsumo() {
    return 15; // Consumo simulado
}

function obtenerMarcaModelo() {
    // Supongamos que el usuario selecciona un vehículo de alguna manera
    // Aquí se simula retornando un modelo específico
    return "Nissan Leaf";
}

// Función para simular la conexión del vehículo y actualizar el dashboard
function conectarVehiculo() {
    actualizarEstadoDashboard();
}

// Llamar a la función para simular la conexión del vehículo al cargar la página
window.onload = function() {
    conectarVehiculo();
};
