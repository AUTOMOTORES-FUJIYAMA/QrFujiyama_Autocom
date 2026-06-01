let origenesDisponibles = [];
let marcasDisponibles = [];
let modelosPorMarca = {};
let modelosDisponibles = [];
let ciudadesDisponibles = [];

function showStep(stepNumber) {
  document.querySelectorAll('.form-step').forEach(step => {
    step.classList.remove('active');
  });
  document.getElementById(`step-${stepNumber}`).classList.add('active');

  document.querySelectorAll('.step').forEach(step => {
    const stepNum = parseInt(step.dataset.step, 10);
    step.classList.remove('active', 'completed');
    if (stepNum === stepNumber) step.classList.add('active');
    else if (stepNum < stepNumber) step.classList.add('completed');
  });
}

function nextStep(currentStep) {
  if (validateStep(currentStep)) {
    showStep(currentStep + 1);
  }
}

function prevStep(currentStep) {
  showStep(currentStep - 1);
}

function validateStep(step) {
  let isValid = true;
  document.querySelectorAll(`#step-${step} .error`).forEach(error => error.textContent = '');

  if (step === 1) {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (!nombre) {
      document.getElementById('nombre-error').textContent = 'Por favor ingrese su nombre';
      isValid = false;
    }
    if (!email || !validateEmail(email)) {
      document.getElementById('email-error').textContent = 'Por favor ingrese un correo válido';
      isValid = false;
    }
    if (!telefono || !validatePhone(telefono)) {
      document.getElementById('telefono-error').textContent = 'Por favor ingrese un teléfono válido';
      isValid = false;
    }
  }

  if (step === 2) {
    const ciudad = document.getElementById('ciudad').value.trim();
    const origen = document.getElementById('origen').value.trim();
    const marca = document.getElementById('marca').value.trim();
    const modelo = document.getElementById('modelo').value.trim();

    if (!ciudad) {
      document.getElementById('ciudad-error').textContent = 'Por favor ingrese su ciudad';
      isValid = false;
    }

    if (!origen || !origenesDisponibles.includes(origen)) {
      document.getElementById('origen-error').textContent = 'Seleccione una opción válida';
      isValid = false;
    }

    if (!marca || !marcasDisponibles.includes(marca)) {
      document.getElementById('marca-error').textContent = 'Seleccione una marca válida';
      isValid = false;
    }

    if (!modelo || !modelosDisponibles.includes(modelo)) {
      document.getElementById('modelo-error').textContent = 'Seleccione un modelo válido';
      isValid = false;
    }
  }

  if (step === 3) {
    const privacidad = document.getElementById('privacidad').checked;
    if (!privacidad) {
      document.getElementById('privacidad-error').textContent = 'Debe aceptar la política de privacidad';
      isValid = false;
    }
  }

  return isValid;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9]{10}$/.test(phone);
}

function submitForm() {
  if (!validateStep(3)) return;

  document.getElementById('step-3-buttons').style.display = 'none';
  document.getElementById('loading-message').style.display = 'block';

  const formData = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    ciudad: document.getElementById('ciudad').value.trim(),
    origen: document.getElementById('origen').value.trim(),
    marca: document.getElementById('marca').value.trim(),
    modelo: document.getElementById('modelo').value.trim(),
    comentarios: document.getElementById('comentarios').value.trim(),
    qrSource: window.location.search || 'default'
  };

  

  fetch("https://script.google.com/macros/s/AKfycbw94QV44o3NcEFpY9pgvNjRC6ZsKbR8Fyn3J1FPlVZ6cPiLydcTfcTxrnR7qzwCoFEz4w/exec", {
    method: "POST",
    body: JSON.stringify(formData)
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'OK') {
        const modelo = document.getElementById("modelo").value.trim();
        const mensaje = `Hola, quiero contactar un asesor. Estoy interesado en ${modelo}.`;
        const numeroAsesor = "573176368977";
        const urlWhatsApp = `https://wa.me/${numeroAsesor}?text=${encodeURIComponent(mensaje)}`;

        const waLink = document.querySelector('#success-message a');
        if (waLink) waLink.href = urlWhatsApp;

        document.getElementById('step-3').style.display = 'none';
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('success-message').style.display = 'block';
      } else {
        alert('Error al guardar: ' + (data.message || 'respuesta inválida'));
        resetStep3UI();
      }
    })
    .catch(err => {
      alert('Error de conexión');
      console.error(err);
      resetStep3UI();
    });
}

function resetStep3UI() {
  document.getElementById('loading-message').style.display = 'none';
  document.getElementById('step-3-buttons').style.display = 'flex';
}

function setupAutocomplete({ inputId, hiddenId, panelId, dataSource, onSelect }) {
  const input = document.getElementById(inputId);
  const hidden = document.getElementById(hiddenId);
  const panel = document.getElementById(panelId);

  function closePanel() {
    panel.classList.remove('open', 'open-up');
    panel.innerHTML = '';
  }

  function maybeOpenUp() {
    const rect = input.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (spaceBelow < 220 && spaceAbove > spaceBelow) panel.classList.add('open-up');
    else panel.classList.remove('open-up');
  }

  function getList() {
    return Array.isArray(dataSource) ? dataSource : [];
  }

  function renderItems(value) {
    const list = getList();
    const query = value.trim().toLowerCase();
    panel.innerHTML = '';

    const filtered = !query
      ? list.slice()
      : list.filter(item => item.toLowerCase().includes(query));

    const limited = filtered.sort((a, b) => a.localeCompare(b, 'es'));;

    if (!limited.length) {
      panel.innerHTML = `<div class="custom-option" style="cursor:default;color:#6b7280;">Sin resultados</div>`;
      panel.classList.add('open');
      maybeOpenUp();
      return;
    }

    limited.forEach(item => {
      const option = document.createElement('div');
      option.className = 'custom-option';
      option.textContent = item;

      option.addEventListener('click', () => {
        input.value = item;
        hidden.value = item;
        closePanel();
        if (typeof onSelect === 'function') onSelect(item);
      });

      panel.appendChild(option);
    });

    panel.classList.add('open');
    maybeOpenUp();
  }

  input.addEventListener('input', () => {
    hidden.value = '';
    renderItems(input.value);
  });

  input.addEventListener('focus', () => {
    renderItems(input.value);
  });

  input.addEventListener('click', () => {
    renderItems(input.value);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      const exact = getList().find(item => item.toLowerCase() === input.value.trim().toLowerCase());
      if (exact) {
        input.value = exact;
        hidden.value = exact;
        if (typeof onSelect === 'function') onSelect(exact);
      }
      closePanel();
    }, 150);
  });

  window.addEventListener('resize', () => {
    if (panel.classList.contains('open')) maybeOpenUp();
  });
}

function initBrandModelFlow() {
  setupAutocomplete({
    inputId: 'origen-input',
    hiddenId: 'origen',
    panelId: 'options-origen',
    dataSource: origenesDisponibles
  });

  setupAutocomplete({
    inputId: 'marca-input',
    hiddenId: 'marca',
    panelId: 'options-marca',
    dataSource: marcasDisponibles,
    onSelect: (marcaSeleccionada) => {
      modelosDisponibles = modelosPorMarca[marcaSeleccionada] || [];

      const modeloInput = document.getElementById('modelo-input');
      const modeloHidden = document.getElementById('modelo');

      modeloInput.value = '';
      modeloHidden.value = '';
      modeloInput.disabled = modelosDisponibles.length === 0;
      modeloInput.readOnly = modelosDisponibles.length === 0;
      modeloInput.placeholder = modelosDisponibles.length ? 'Escribe o toca para ver opciones...' : 'Sin modelos disponibles';

      setupAutocomplete({
        inputId: 'modelo-input',
        hiddenId: 'modelo',
        panelId: 'options-modelo',
        dataSource: modelosDisponibles
      });
    }
  });

  const modeloInput = document.getElementById('modelo-input');
  modeloInput.addEventListener('focus', () => {
    if (!modelosDisponibles.length) return;
  });
}

function loadData() {
  fetch("https://script.google.com/macros/s/AKfycbw94QV44o3NcEFpY9pgvNjRC6ZsKbR8Fyn3J1FPlVZ6cPiLydcTfcTxrnR7qzwCoFEz4w/exec")
    .then(res => res.json())
    .then(data => {
      origenesDisponibles = data.origenes || [];
      marcasDisponibles = data.marcas || [];  
      modelosPorMarca = data.modelosPorMarca || {};
      ciudadesDisponibles = data.ciudades || [];

      initBrandModelFlow();
      loadCiudades();
    })
    .catch(err => {
      console.error("Error cargando datos dinámicos", err);
    });
}

// ===== MODAL PRIVACIDAD =====
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-privacidad");
  const openBtn = document.getElementById("open-privacidad");
  const closeBtn = document.getElementById("close-privacidad");
  const aceptarBtn = document.getElementById("aceptar-privacidad");

  // Abrir modal SOLO al hacer click en el texto
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation(); // evita que active el checkbox
    modal.style.display = "block";
  });

  // Cerrar con la X
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Cerrar con botón "Entendido"
  aceptarBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Cerrar haciendo click fuera del modal
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

showStep(1);
loadData();
function loadCiudades() {
  fetch("colombia.json")
    .then(res => res.json())
    .then(data => {

      // ciudadesDisponibles = data.flatMap(dep => dep.ciudades);

      setupAutocomplete({
        inputId: 'ciudad-input',
        hiddenId: 'ciudad',
        panelId: 'ciudad-list',
        dataSource: ciudadesDisponibles
      });

    })
    .catch(err => {
      console.error("Error cargando ciudades", err);
    });
}
// loadCiudades();