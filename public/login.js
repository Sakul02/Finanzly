// Captura de elementos del formulario
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const loginForm = document.getElementById('login-form');
const authContent = document.getElementById('auth-content');
const introContent = document.getElementById('intro-content');
const loginTrigger = document.getElementById('login-trigger');
const registerTrigger = document.getElementById('register-trigger');
const presentationTrigger = document.getElementById('presentation-trigger');
const submitBtn = document.getElementById('submit-btn');
const formHeading = document.getElementById('form-heading');
const formSubheading = document.getElementById('form-subheading');
const nameField = document.getElementById('name-field');
const surnameField = document.getElementById('surname-field');
const rememberMeCheckbox = document.getElementById('remember-me');
const forgotPasswordLink = document.getElementById('forgot-password');
const loginExtraOptions = document.getElementById('login-extra-options');

let isRegisterMode = false;
const REMEMBER_ME_KEY = 'finanzly-remember-me';

// Elementos de los personajes
const charPurple = document.getElementById('char-purple');
const charBlack = document.getElementById('char-black');
const charOrange = document.getElementById('char-orange');
const charYellow = document.getElementById('char-yellow');
const mouthYellow = document.getElementById('mouth-yellow');

// Selección de los ojos para el parpadeo
const purpleEyes = charPurple.querySelectorAll('.eye');
const blackEyes = charBlack.querySelectorAll('.eye');

let isTypingPassword = false;
let isTypingEmail = false; 
let showPassword = false;
let emailFocusSequenceInitiated = false; 
let currentPasswordScore = 0;

// Configurar transiciones suaves para los párpados
purpleEyes.forEach(eye => eye.style.transition = 'transform 0.1s ease-in-out');
blackEyes.forEach(eye => eye.style.transition = 'transform 0.1s ease-in-out');

// FUNCIÓN AUXILIAR: Selecciona de forma segura el elemento que se debe mover en el ojo
function obtenerElementosOjos(personaje) {
    const pupilas = personaje.querySelectorAll('.pupil');
    // Si tiene pupilas internas (morado y negro), movemos las pupilas
    if (pupilas.length > 0) return pupilas;
    // Si es un puntito simple (naranja y amarillo), movemos el elemento .eye directamente
    return personaje.querySelectorAll('.eye');
}

// Función central para manejar la "Coreografía" de los estados
function actualizarAnimacionPersonajes(e = null) {
    // --- NUEVO: Reset preventivo para la boca del amarillo al inicio de cada ciclo ---
    const mouthYellow = document.getElementById('mouth-yellow');
    if (mouthYellow) mouthYellow.style.transform = 'none';

    // CASO 0: Contraseña visible => todos de espaldas independientemente del foco
    if (showPassword) {
        const scale = 1 + 0.12 * currentPasswordScore;
        charPurple.style.transform = 'skewX(0deg) scaleY(1) translateX(0px)';
        charBlack.style.transform = 'skewX(0deg) scaleY(1) translateX(0px)';
        charOrange.style.transform = 'skewX(0deg)';
        charYellow.style.transform = 'skewX(0deg)';

        obtenerElementosOjos(charPurple).forEach(p => p.style.transform = `translate(-5px, -4px) scale(${scale})`);
        obtenerElementosOjos(charBlack).forEach(p => p.style.transform = `translate(-4px, -5px) scale(${scale})`);
        obtenerElementosOjos(charYellow).forEach(p => p.style.transform = `translate(-20px, -10px) scale(${scale})`);
        charOrange.querySelectorAll('.pupil').forEach(p => p.style.transform = `translate(-40px, -20px) scale(${scale})`);
        if (mouthYellow) mouthYellow.style.transform = `translate(${-20}px, ${-10 + (1.5 - currentPasswordScore) * 4}px)`;
        return;
    }

    // CASO 1: Escribiendo el GMAIL (Estiramiento MAX y secuencia de miradas de 1 segundo)
    if (isTypingEmail) {
        charPurple.style.transform = `skewX(-12deg) scaleY(1.1) translateX(40px)`;
        charBlack.style.transform = `skewX(-10deg) scaleY(1.05) translateX(20px)`;
        charOrange.style.transform = `skewX(0deg)`;
        charYellow.style.transform = `skewX(0deg)`;

        const strength = currentPasswordScore || 0;
        const pupilScale = 1 + 0.12 * strength;
        const mouthAdj = (1.5 - strength) * 4; // positive -> mouth down, negative -> mouth up

        if (emailFocusSequenceInitiated) {
            obtenerElementosOjos(charPurple).forEach(p => p.style.transform = `translate(5px, 5px) scale(${pupilScale})`);
            obtenerElementosOjos(charBlack).forEach(p => p.style.transform = `translate(-4px, -6px) scale(${pupilScale})`);
            obtenerElementosOjos(charYellow).forEach(p => p.style.transform = `translate(6px, 5px) scale(${pupilScale})`);
            obtenerElementosOjos(charOrange).forEach(p => p.style.transform = `translate(-4px, -1px) scale(${pupilScale})`);
            if (mouthYellow) mouthYellow.style.transform = `translate(6px, ${4 + mouthAdj}px)`;
        } else {
            obtenerElementosOjos(charPurple).forEach(p => p.style.transform = `translate(6px, 3px) scale(${pupilScale})`);
            obtenerElementosOjos(charBlack).forEach(p => p.style.transform = `translate(6px, 3px) scale(${pupilScale})`);
            obtenerElementosOjos(charYellow).forEach(p => p.style.transform = `translate(6px, 5px) scale(${pupilScale})`);
            obtenerElementosOjos(charOrange).forEach(p => p.style.transform = `translate(4px, 0px) scale(${pupilScale})`);
            if (mouthYellow) mouthYellow.style.transform = `translate(5px, ${3 + mouthAdj}px)`;
        }

        return; 
    }

    // CASO 2: Escribiendo CONTRASEÑA y está OCULTA
    if (isTypingPassword && !showPassword) {
        // MODIFICACIÓN: El morado se estira exactamente igual que en el Gmail (skew -12, scale 1.1, translate 40px)
        if (passwordInput.value.length > 0) {
            if (mouthYellow) mouthYellow.style.transform = `translate(5px, ${5 + (1.5 - currentPasswordScore) * 4}px)`;
            charPurple.style.transform = `skewX(-12deg) scaleY(1.1) translateX(40px)`;
        } else {
            if (mouthYellow) mouthYellow.style.transform = `translate(0px, ${ (1.5 - currentPasswordScore) * 4 }px)`;
            charPurple.style.transform = 'skewX(0deg) scaleY(1) translateX(0px)';
        }
        
        charBlack.style.transform = `skewX(-3deg) scaleY(1.02) translateX(-5px)`;
        charOrange.style.transform = `skewX(-2deg)`;
        charYellow.style.transform = `skewX(-2deg)`;

        [charPurple, charBlack, charOrange, charYellow].forEach(personaje => {
            obtenerElementosOjos(personaje).forEach(elementoOjo => {
                elementoOjo.style.transform = `translate(5px, 5px) scale(${1 + 0.12 * currentPasswordScore})`;
            });
        });

        return;
    }

    // CASO 3: Escribiendo CONTRASEÑA y está VISIBLE
    if (isTypingPassword && showPassword) {
        // Cuerpos erguidos y neutrales
        charPurple.style.transform = 'skewX(0deg) scaleY(1) translateX(0px)';
        charBlack.style.transform = 'skewX(0deg) scaleY(1) translateX(0px)';
        charOrange.style.transform = 'skewX(0deg)';
        charYellow.style.transform = 'skewX(0deg)';

        // Morado y Negro: Mirada arriba-izquierda

        obtenerElementosOjos(charPurple).forEach(p => p.style.transform = `translate(-5px, -4px) scale(${1 + 0.12 * currentPasswordScore})`);
        obtenerElementosOjos(charBlack).forEach(p => p.style.transform = `translate(-4px, -5px) scale(${1 + 0.12 * currentPasswordScore})`);

        // AMARILLO: Mueve ojos y boca igual que los otros (hacia el mismo punto)
        obtenerElementosOjos(charYellow).forEach(p => p.style.transform = `translate(-20px, -10px) scale(${1 + 0.12 * currentPasswordScore})`);
        if (mouthYellow) mouthYellow.style.transform = `translate(${-20}px, ${-10 + (1.5 - currentPasswordScore) * 4}px)`;

        // NARANJA: Ojos hacia la izquierda (mirando a la pared)
        // Como el naranja tiene sus pupilas directamente como .pupil, usamos el selector directo
        charOrange.querySelectorAll('.pupil').forEach(p => p.style.transform = `translate(-40px, -20px) scale(${1 + 0.12 * currentPasswordScore})`);
        
        return;
    }

        // CASO 4: ESTADO NORMAL (Seguimiento dinámico del mouse adaptado para los 4)
    if (e) {
        if (mouthYellow) mouthYellow.style.transform = 'none';
        const windowWidth = window.innerWidth;
        const panelCenterX = windowWidth / 4;

        const eyeContainers = document.querySelectorAll('.eye-container');
        eyeContainers.forEach(container => {
            const parentChar = container.parentElement;
            const isPurpleOrBlack = parentChar === charPurple || parentChar === charBlack;

            // Buscamos .pupil, y si no existe en ese contenedor, usamos .eye directamente
            let targets = container.querySelectorAll('.pupil');
            if (targets.length === 0) {
                targets = container.querySelectorAll('.eye');
            }

            const rect = container.getBoundingClientRect();
            const containerX = rect.left + rect.width / 2;
            const containerY = rect.top + rect.height / 2;
            
            const deltaX = e.clientX - containerX;
            const deltaY = e.clientY - containerY;
            const distToCenter = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            
            // EFECTO VIZCO: Si es morado o negro y el ratón está muy cerca del centro de sus ojos
            if (isPurpleOrBlack && distToCenter < 30) {
                targets.forEach((target, index) => {
                    // El ojo izquierdo (0) mira a la derecha, el derecho (1) a la izquierda
                    const xDir = index === 0 ? 3 : -3;
                    target.style.transform = `translate(${xDir}px, 2px)`;
                });
                if (parentChar === charYellow && mouthYellow) {
                    mouthYellow.style.transform = 'translate(3px, 4px)';
                }
            } else {
                // Seguimiento normal del ratón
                const distance = Math.min(distToCenter, 5);
                const angle = Math.atan2(deltaY, deltaX);
                
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                
                targets.forEach(target => {
                    target.style.transform = `translate(${x}px, ${y}px) scale(${1 + 0.12 * currentPasswordScore})`;
                });
                if (parentChar === charYellow && mouthYellow) {
                    const mouthY = Math.max(-8, Math.min(8, y * 0.85));
                    mouthYellow.style.transform = `translate(${x}px, ${mouthY + (1.5 - currentPasswordScore) * 4}px)`;
                }
            }
        });


        const mouseFromCenter = e.clientX - panelCenterX;
        const skew = Math.max(-6, Math.min(6, -mouseFromCenter / 120));

        charPurple.style.transform = `skewX(${skew}deg) scaleY(1)`;
        charBlack.style.transform = `skewX(${skew}deg) scaleY(1)`;
        charOrange.style.transform = `skewX(${skew}deg)`;
        charYellow.style.transform = `skewX(${skew}deg)`;
    }
}

// --- LÓGICA DE PARPADEO ---
function ejecutarParpadeo(ojos) {
    ojos.forEach(eye => eye.style.transform = 'scaleY(0)');
    setTimeout(() => {
        ojos.forEach(eye => eye.style.transform = 'scaleY(1)');
    }, 120);
}

let purpleGlanceTimeout = null;

function calcularVectorAOjoDestino(origenChar, destinoChar) {
    const origenEye = origenChar.querySelector('.eye');
    const destinoEye = destinoChar.querySelector('.eye');
    if (!origenEye || !destinoEye) {
        return { x: 8, y: -3 };
    }

    const origenRect = origenEye.getBoundingClientRect();
    const destinoRect = destinoEye.getBoundingClientRect();

    const dx = destinoRect.left + destinoRect.width / 2 - (origenRect.left + origenRect.width / 2);
    const dy = destinoRect.top + destinoRect.height / 2 - (origenRect.top + origenRect.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const maxOffset = 10;

    return {
        x: Math.max(-maxOffset, Math.min(maxOffset, (dx / distance) * 8)),
        y: Math.max(-maxOffset, Math.min(maxOffset, (dy / distance) * 8))
    };
}

function mirarAOjosNegros() {
    if (!(isTypingPassword && showPassword)) return;

    const purplePupils = Array.from(obtenerElementosOjos(charPurple));
    const originalTransforms = purplePupils.map(p => p.style.transform);
    const scale = 1 + 0.12 * currentPasswordScore;
    const { x, y } = calcularVectorAOjoDestino(charPurple, charBlack);

    purplePupils.forEach(p => {
        p.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    });

    if (purpleGlanceTimeout) {
        clearTimeout(purpleGlanceTimeout);
    }

    purpleGlanceTimeout = setTimeout(() => {
        purplePupils.forEach((p, index) => {
            p.style.transform = originalTransforms[index] || `translate(-5px, -4px) scale(${scale})`;
        });
        purpleGlanceTimeout = null;
    }, 1000);
}

// Intervalo combinado para parpadeo
setInterval(() => {
    if (isTypingPassword && showPassword) {
        ejecutarParpadeo([...purpleEyes, ...blackEyes]);
    } else {
        ejecutarParpadeo(purpleEyes);
    }
}, 5000);

setInterval(() => {
    if (!(isTypingPassword && showPassword)) {
        ejecutarParpadeo(blackEyes);
    }
}, 7500);

// Cuando la contraseña está visible, morado mira a los ojos del negro cada 4 segundos
setInterval(() => {
    if (isTypingPassword && showPassword) {
        mirarAOjosNegros();
    }
}, 4000);


// --- ESCUCHADORES DE EVENTOS ---

window.addEventListener('mousemove', (e) => {
    if (showPassword || (!isTypingEmail && !isTypingPassword)) {
        actualizarAnimacionPersonajes(e);
    }
});

// Eventos del Email
emailInput.addEventListener('focus', () => {
    isTypingEmail = true;
    emailFocusSequenceInitiated = true; 
    actualizarAnimacionPersonajes();
    
    setTimeout(() => {
        if (isTypingEmail) { 
            emailFocusSequenceInitiated = false;
            actualizarAnimacionPersonajes();
        }
    }, 1000);
});

emailInput.addEventListener('blur', () => {
    isTypingEmail = false;
    emailFocusSequenceInitiated = false;
    charPurple.style.transform = 'skewX(0deg) scaleY(1) translateX(0px)';
    charBlack.style.transform = 'skewX(0deg) scaleY(1) translateX(0px)';
    actualizarAnimacionPersonajes();
});

// Eventos del Password
passwordInput.addEventListener('focus', () => {
    isTypingPassword = true;
    actualizarAnimacionPersonajes();
});

passwordInput.addEventListener('blur', () => {
    isTypingPassword = false;
    charPurple.style.transform = 'skewX(0deg) scaleY(1) translateX(0px)';
    charBlack.style.transform = 'skewX(0deg) scaleY(1) translateX(0px)';
    actualizarAnimacionPersonajes();
});

// Ojito de visibilidad de contraseña
const activarAnimacionPassword = () => {
    isTypingPassword = true;
    actualizarAnimacionPersonajes();
};

const desactivarAnimacionPassword = () => {
    if (document.activeElement !== passwordInput && document.activeElement !== togglePasswordBtn) {
        isTypingPassword = false;
        actualizarAnimacionPersonajes();
    }
};

togglePasswordBtn.addEventListener('mousedown', activarAnimacionPassword);
togglePasswordBtn.addEventListener('mouseup', desactivarAnimacionPassword);
togglePasswordBtn.addEventListener('focus', activarAnimacionPassword);
togglePasswordBtn.addEventListener('blur', desactivarAnimacionPassword);

togglePasswordBtn.addEventListener('click', () => {
    showPassword = !showPassword;
    passwordInput.type = showPassword ? 'text' : 'password';
    togglePasswordBtn.textContent = showPassword ? '🔒' : '👁️';
    activarAnimacionPassword();
});

function persistRememberedCredentials() {
    if (rememberMeCheckbox.checked) {
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value
        }));
    } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
    }
}

function loadRememberedCredentials() {
    try {
        const saved = JSON.parse(localStorage.getItem(REMEMBER_ME_KEY) || 'null');
        if (saved?.email) {
            emailInput.value = saved.email;
            passwordInput.value = saved.password || '';
            rememberMeCheckbox.checked = true;
            updateEmailFeedback();
            updatePasswordMeter();
            updateFormValidity();
        }
    } catch (error) {
        console.warn('No se pudieron cargar los datos guardados.', error);
    }
}

// Formulario Submit
// ==========================================
// LOGIN CONTRA LA BASE DE DATOS
// ==========================================

// ==========================================
// LOGIN / REGISTRO
// ==========================================

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Datos adicionales del registro
    const nombre = document.getElementById('first-name').value.trim();
    const apellido = document.getElementById('last-name').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = isRegisterMode
        ? 'Creando cuenta...'
        : 'Ingresando...';

    try {

        // ==========================================
        // REGISTRO
        // ==========================================

        if (isRegisterMode) {

            if (!nombre || !apellido) {
                alert('Completá tu nombre y apellido.');

                submitBtn.disabled = false;
                submitBtn.textContent = 'Registrarse';
                updateFormValidity();

                return;
            }

            const respuesta = await fetch('/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: nombre,
                    apellido: apellido,
                    email: email,
                    password: password
                })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                alert(datos.error || 'No se pudo crear la cuenta.');

                submitBtn.disabled = false;
                submitBtn.textContent = 'Registrarse';
                updateFormValidity();

                return;
            }

            // Registro correcto
            alert('¡Cuenta creada correctamente! Ahora podés iniciar sesión.');

            // Volver al modo login
            openAuthForm(false);

            // Limpiar contraseña
            passwordInput.value = '';

            return;
        }


        // ==========================================
        // LOGIN
        // ==========================================

        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.error || 'No se pudo iniciar sesión.');

            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
            updateFormValidity();

            return;
        }

        // Guardar usuario actual
        sessionStorage.setItem(
            'finanzly_usuario',
            JSON.stringify(datos.usuario)
        );

        // Recordar datos
        persistRememberedCredentials();

        // Entrar a Finanzly
        window.location.href = 'index.html';

    } catch (error) {

        console.error('❌ Error de autenticación:', error);

        alert('No se pudo conectar con el servidor.');

        submitBtn.disabled = false;
        submitBtn.textContent = isRegisterMode
            ? 'Registrarse'
            : 'Iniciar Sesión';

        updateFormValidity();
    }
});

forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
});

rememberMeCheckbox.addEventListener('change', persistRememberedCredentials);

const registerPasswordStrength = document.getElementById('register-password-strength');
const passwordMeter = document.getElementById('password-meter');

function togglePasswordStrengthVisibility(show) {
    if (!registerPasswordStrength) return;
    registerPasswordStrength.classList.toggle('hidden', !show);
}

function openAuthForm(registerMode) {
        isRegisterMode = registerMode;
    introContent.classList.add('hidden');
        authContent.classList.remove('hidden');
    loginTrigger.classList.add('hidden');
    registerTrigger.classList.add('hidden');
    presentationTrigger.classList.remove('hidden');
        nameField.classList.toggle('hidden', !isRegisterMode);
        surnameField.classList.toggle('hidden', !isRegisterMode);
        togglePasswordStrengthVisibility(isRegisterMode && passwordInput.value.length > 0);
        if (loginExtraOptions) {
            loginExtraOptions.classList.toggle('hidden', isRegisterMode);
        }
        formHeading.textContent = isRegisterMode ? 'Crea tu cuenta' : '¡Bienvenido de nuevo!';
        formSubheading.textContent = isRegisterMode ? 'Completa los datos para registrarte' : 'Por favor, ingresa tus datos de acceso';
        submitBtn.textContent = isRegisterMode ? 'Registrarse' : 'Iniciar Sesión';
        updateFormValidity();
        emailInput.focus();
    }

    loginTrigger.addEventListener('click', () => openAuthForm(false));
    registerTrigger.addEventListener('click', () => openAuthForm(true));
    presentationTrigger.addEventListener('click', () => {
        authContent.classList.add('hidden');
        introContent.classList.remove('hidden');
        loginTrigger.classList.remove('hidden');
        registerTrigger.classList.remove('hidden');
        presentationTrigger.classList.add('hidden');
    });

// --- VALIDACIÓN INLINE Y MEDIDOR DE CONTRASEÑA ---
const passwordMeterBar = document.getElementById('password-meter-bar');
const passwordFeedback = document.getElementById('password-feedback');
const emailFeedback = document.getElementById('email-feedback');

function validateEmail(value) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(value).toLowerCase());
}

function evaluatePasswordStrength(pw) {
    let score = 0;
    if (!pw) return 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    // cap at 3
    return Math.min(score, 3);
}

function updatePasswordMeter() {
    const val = passwordInput.value || '';
    const score = evaluatePasswordStrength(val);
    passwordMeterBar.className = 'h-full w-0 transition-all';
    passwordMeterBar.classList.add(`meter-${score}`);

    if (score === 0) {
        passwordFeedback.textContent = 'Usa mínimo 8 caracteres, mayúsculas y números para mayor seguridad.';
        passwordFeedback.style.color = 'rgba(148,163,184,1)';
    } else if (score === 1) {
        passwordFeedback.textContent = 'Contraseña débil';
        passwordFeedback.style.color = '#fb923c';
    } else if (score === 2) {
        passwordFeedback.textContent = 'Contraseña moderada';
        passwordFeedback.style.color = '#f59e0b';
    } else {
        passwordFeedback.textContent = 'Contraseña fuerte';
        passwordFeedback.style.color = '#10b981';
    }
}

function updateEmailFeedback() {
    const valid = validateEmail(emailInput.value || '');
    if (!emailInput.value) {
        emailFeedback.classList.add('hidden');
        return false;
    }
    if (!valid) {
        emailFeedback.classList.remove('hidden');
    } else {
        emailFeedback.classList.add('hidden');
    }
    return valid;
}

function updateFormValidity() {
    const emailValid = updateEmailFeedback();
    const pw = passwordInput.value || '';
    const strength = evaluatePasswordStrength(pw);

    if (isRegisterMode) {
        const nombre = document.getElementById('first-name').value.trim();
        const apellido = document.getElementById('last-name').value.trim();

        submitBtn.disabled = !(
            nombre &&
            apellido &&
            emailValid &&
            strength >= 2
        );

        submitBtn.style.opacity = submitBtn.disabled ? '0.6' : '1';
    }
}

emailInput.addEventListener('input', () => {
    updateEmailFeedback();
    updateFormValidity();
    persistRememberedCredentials();
});

passwordInput.addEventListener('focus', () => {
    if (isRegisterMode) {
        togglePasswordStrengthVisibility(true);
    }
});

passwordInput.addEventListener('input', () => {
    actualizarAnimacionPersonajes();
    updatePasswordMeter();
    updateFormValidity();
    persistRememberedCredentials();
    if (isRegisterMode) {
        togglePasswordStrengthVisibility(true);
    }
});

passwordInput.addEventListener('blur', () => {
    if (isRegisterMode && !passwordInput.value) {
        togglePasswordStrengthVisibility(false);
    }
});

// inicializar estado
updatePasswordMeter();
updateFormValidity();
loadRememberedCredentials();

// Actualizar validación al escribir nombre y apellido
document.getElementById('first-name').addEventListener('input', updateFormValidity);
document.getElementById('last-name').addEventListener('input', updateFormValidity);