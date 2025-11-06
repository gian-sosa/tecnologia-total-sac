// Data Storage
let clientes = [];
let productos = [];
let garantias = [];
let ordenes = [];
let ordenCounter = 1;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("fechaCompra").value = today;
  document.getElementById("fechaIngreso").value = today;
  document.getElementById("fechaInicio").value = today;

  loadData();
  updateDashboard();
});

// Navigation
function showView(viewId) {
  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
  event.target.classList.add("active");
}

// Cliente Form
document.getElementById("formCliente").addEventListener("submit", function (e) {
  e.preventDefault();

  const cliente = {
    id: Date.now(),
    tipoDoc: document.getElementById("tipoDoc").value,
    numDoc: document.getElementById("numDoc").value,
    nombres: document.getElementById("nombres").value,
    apellidos: document.getElementById("apellidos").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value,
    direccion: document.getElementById("direccion").value,
  };

  clientes.push(cliente);
  saveData();
  this.reset();
  renderClientes();
  updateSelects();
  alert("Cliente registrado exitosamente");
});

// Producto Form
document
  .getElementById("formProducto")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const producto = {
      id: Date.now(),
      clienteId: document.getElementById("prodCliente").value,
      tipoComprobante: document.getElementById("tipoComprobante").value,
      numComprobante: document.getElementById("numComprobante").value,
      fechaCompra: document.getElementById("fechaCompra").value,
      categoria: document.getElementById("categoria").value,
      marca: document.getElementById("marca").value,
      modelo: document.getElementById("modelo").value,
      numSerie: document.getElementById("numSerie").value,
      descripcion: document.getElementById("descripcionProd").value,
    };

    productos.push(producto);
    saveData();
    this.reset();
    renderProductos();
    updateSelects();
    alert("Producto registrado exitosamente");
  });

// Garantía Form
document
  .getElementById("formGarantia")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const fechaInicio = new Date(document.getElementById("fechaInicio").value);
    const duracion = parseInt(document.getElementById("duracionMeses").value);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + duracion);

    const garantia = {
      id: Date.now(),
      productoId: document.getElementById("garProducto").value,
      tipo: document.getElementById("tipoGarantia").value,
      fechaInicio: document.getElementById("fechaInicio").value,
      fechaFin: fechaFin.toISOString().split("T")[0],
      duracionMeses: duracion,
      terminos: document.getElementById("terminos").value,
    };

    garantias.push(garantia);
    saveData();
    this.reset();
    renderGarantias();
    alert("Garantía registrada exitosamente");
  });

// Orden Form
document.getElementById("formOrden").addEventListener("submit", function (e) {
  e.preventDefault();

  const orden = {
    id: Date.now(),
    numOrden: "OS-" + String(ordenCounter).padStart(5, "0"),
    productoId: document.getElementById("ordenProducto").value,
    fechaIngreso: document.getElementById("fechaIngreso").value,
    estado: document.getElementById("estadoOrden").value,
    prioridad: document.getElementById("prioridad").value,
    problemaReportado: document.getElementById("problemaReportado").value,
    diagnostico: document.getElementById("diagnostico").value,
    reparacion: document.getElementById("reparacion").value,
    repuestos: document.getElementById("repuestos").value,
    costoRepuestos: parseFloat(document.getElementById("costoRepuestos").value),
    costoMano: parseFloat(document.getElementById("costoMano").value),
    tiempoAtencion:
      parseFloat(document.getElementById("tiempoAtencion").value) || 0,
    historial: [
      {
        fecha: new Date().toISOString(),
        estado: document.getElementById("estadoOrden").value,
        nota: "Orden creada",
      },
    ],
  };

  ordenes.push(orden);
  ordenCounter++;
  saveData();
  this.reset();
  renderOrdenes();
  updateDashboard();
  alert("Orden de servicio creada exitosamente");
});

// Render Functions
function renderClientes() {
  const tbody = document.getElementById("tablaClientes");
  const search = document.getElementById("searchCliente").value.toLowerCase();

  const filtered = clientes.filter(
    (c) =>
      c.numDoc.toLowerCase().includes(search) ||
      (c.nombres + " " + c.apellidos).toLowerCase().includes(search) ||
      c.telefono.includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No se encontraron clientes</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (c) => `
                <tr>
                    <td>${c.tipoDoc}: ${c.numDoc}</td>
                    <td>${c.nombres} ${c.apellidos}</td>
                    <td>${c.telefono}</td>
                    <td>${c.email || "-"}</td>
                    <td>
                        <button class="action-btn" onclick="viewCliente(${
                          c.id
                        })" title="Ver detalle">👁️</button>
                        <button class="action-btn" onclick="deleteCliente(${
                          c.id
                        })" title="Eliminar">🗑️</button>
                    </td>
                </tr>
            `
    )
    .join("");
}

function renderProductos() {
  const tbody = document.getElementById("tablaProductos");
  const search = document.getElementById("searchProducto").value.toLowerCase();

  const filtered = productos.filter(
    (p) =>
      p.numSerie.toLowerCase().includes(search) ||
      p.marca.toLowerCase().includes(search) ||
      p.modelo.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; color: var(--text-light);">No se encontraron productos</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((p) => {
      const cliente = clientes.find((c) => c.id == p.clienteId);
      return `
                    <tr>
                        <td><strong>${p.numSerie}</strong></td>
                        <td>${p.marca} ${p.modelo}<br><small>${
        p.categoria
      }</small></td>
                        <td>${
                          cliente
                            ? cliente.nombres + " " + cliente.apellidos
                            : "-"
                        }</td>
                        <td>${p.tipoComprobante} ${p.numComprobante}</td>
                        <td>${formatDate(p.fechaCompra)}</td>
                        <td>
                            <button class="action-btn" onclick="viewProducto(${
                              p.id
                            })" title="Ver detalle">👁️</button>
                            <button class="action-btn" onclick="deleteProducto(${
                              p.id
                            })" title="Eliminar">🗑️</button>
                        </td>
                    </tr>
                `;
    })
    .join("");
}

function renderGarantias() {
  const tbody = document.getElementById("tablaGarantias");
  const search = document.getElementById("searchGarantia").value.toLowerCase();

  const filtered = garantias.filter((g) => {
    const producto = productos.find((p) => p.id == g.productoId);
    if (!producto) return false;
    const cliente = clientes.find((c) => c.id == producto.clienteId);
    return (
      producto.numSerie.toLowerCase().includes(search) ||
      (cliente &&
        (cliente.nombres + " " + cliente.apellidos)
          .toLowerCase()
          .includes(search))
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align: center; color: var(--text-light);">No se encontraron garantías</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((g) => {
      const producto = productos.find((p) => p.id == g.productoId);
      const cliente = producto
        ? clientes.find((c) => c.id == producto.clienteId)
        : null;
      const vigente = new Date(g.fechaFin) >= new Date();

      return `
                    <tr>
                        <td>${
                          producto
                            ? producto.marca + " " + producto.modelo
                            : "-"
                        }<br><small>${
        producto ? producto.numSerie : "-"
      }</small></td>
                        <td>${
                          cliente
                            ? cliente.nombres + " " + cliente.apellidos
                            : "-"
                        }</td>
                        <td>${g.tipo}</td>
                        <td>${formatDate(g.fechaInicio)}</td>
                        <td>${formatDate(g.fechaFin)}</td>
                        <td><span class="badge ${
                          vigente ? "badge-success" : "badge-danger"
                        }">${vigente ? "Vigente" : "Vencida"}</span></td>
                    </tr>
                `;
    })
    .join("");
}

function renderOrdenes() {
  const tbody = document.getElementById("tablaOrdenes");
  const search = document.getElementById("searchOrden").value.toLowerCase();
  const filterEstado = document.getElementById("filterEstado").value;

  const filtered = ordenes.filter((o) => {
    const producto = productos.find((p) => p.id == o.productoId);
    const cliente = producto
      ? clientes.find((c) => c.id == producto.clienteId)
      : null;

    const matchSearch =
      o.numOrden.toLowerCase().includes(search) ||
      o.estado.toLowerCase().includes(search) ||
      (producto && producto.numSerie.toLowerCase().includes(search)) ||
      (cliente &&
        (cliente.nombres + " " + cliente.apellidos)
          .toLowerCase()
          .includes(search));

    const matchEstado = !filterEstado || o.estado === filterEstado;

    return matchSearch && matchEstado;
  });

  if (filtered.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; color: var(--text-light);">No se encontraron órdenes</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((o) => {
      const producto = productos.find((p) => p.id == o.productoId);
      const cliente = producto
        ? clientes.find((c) => c.id == producto.clienteId)
        : null;
      const estadoClass = getEstadoClass(o.estado);

      return `
                    <tr>
                        <td><strong>${o.numOrden}</strong></td>
                        <td>${
                          producto
                            ? producto.marca + " " + producto.modelo
                            : "-"
                        }<br><small>${
        producto ? producto.numSerie : "-"
      }</small></td>
                        <td>${
                          cliente
                            ? cliente.nombres + " " + cliente.apellidos
                            : "-"
                        }</td>
                        <td><span class="badge ${estadoClass}">${
        o.estado
      }</span></td>
                        <td>${formatDate(o.fechaIngreso)}</td>
                        <td>${o.tiempoAtencion || 0}</td>
                        <td>
                            <button class="action-btn" onclick="viewOrden(${
                              o.id
                            })" title="Ver detalle">👁️</button>
                            <button class="action-btn" onclick="editOrden(${
                              o.id
                            })" title="Editar">✏️</button>
                        </td>
                    </tr>
                `;
    })
    .join("");

  renderOrdenesRecientes();
}

function renderOrdenesRecientes() {
  const tbody = document.getElementById("ordenesRecientes");
  const recientes = ordenes.slice(-5).reverse();

  if (recientes.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No hay órdenes registradas</td></tr>';
    return;
  }

  tbody.innerHTML = recientes
    .map((o) => {
      const producto = productos.find((p) => p.id == o.productoId);
      const cliente = producto
        ? clientes.find((c) => c.id == producto.clienteId)
        : null;
      const estadoClass = getEstadoClass(o.estado);

      return `
                    <tr>
                        <td><strong>${o.numOrden}</strong></td>
                        <td>${
                          cliente
                            ? cliente.nombres + " " + cliente.apellidos
                            : "-"
                        }</td>
                        <td>${
                          producto
                            ? producto.marca + " " + producto.modelo
                            : "-"
                        }</td>
                        <td><span class="badge ${estadoClass}">${
        o.estado
      }</span></td>
                        <td>${formatDate(o.fechaIngreso)}</td>
                    </tr>
                `;
    })
    .join("");
}

// Update Functions
function updateSelects() {
  // Update cliente select
  const prodClienteSelect = document.getElementById("prodCliente");
  prodClienteSelect.innerHTML =
    '<option value="">Seleccione un cliente</option>' +
    clientes
      .map(
        (c) =>
          `<option value="${c.id}">${c.nombres} ${c.apellidos} (${c.numDoc})</option>`
      )
      .join("");

  // Update producto selects
  const garProductoSelect = document.getElementById("garProducto");
  const ordenProductoSelect = document.getElementById("ordenProducto");

  const productosOptions = productos
    .map((p) => {
      const cliente = clientes.find((c) => c.id == p.clienteId);
      return `<option value="${p.id}">${p.marca} ${p.modelo} - ${p.numSerie} ${
        cliente ? "(" + cliente.nombres + ")" : ""
      }</option>`;
    })
    .join("");

  garProductoSelect.innerHTML =
    '<option value="">Seleccione un producto</option>' + productosOptions;
  ordenProductoSelect.innerHTML =
    '<option value="">Seleccione un producto</option>' + productosOptions;
}

function updateDashboard() {
  const activas = ordenes.filter(
    (o) => !["Entregado"].includes(o.estado)
  ).length;
  const enDiagnostico = ordenes.filter(
    (o) => o.estado === "En Diagnóstico"
  ).length;
  const enReparacion = ordenes.filter(
    (o) => o.estado === "En Reparación"
  ).length;
  const garantiasVigentes = garantias.filter(
    (g) => new Date(g.fechaFin) >= new Date()
  ).length;

  document.getElementById("statActivas").textContent = activas;
  document.getElementById("statDiagnostico").textContent = enDiagnostico;
  document.getElementById("statReparacion").textContent = enReparacion;
  document.getElementById("statGarantias").textContent = garantiasVigentes;
}

// View Functions
function viewOrden(id) {
  const orden = ordenes.find((o) => o.id === id);
  if (!orden) return;

  const producto = productos.find((p) => p.id == orden.productoId);
  const cliente = producto
    ? clientes.find((c) => c.id == producto.clienteId)
    : null;
  const garantia = garantias.find(
    (g) =>
      g.productoId == orden.productoId && new Date(g.fechaFin) >= new Date()
  );

  const costoTotal = orden.costoRepuestos + orden.costoMano;

  const content = `
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="color: var(--primary); margin-bottom: 1rem;">Orden: ${
                      orden.numOrden
                    }</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <strong>Estado:</strong> <span class="badge ${getEstadoClass(
                              orden.estado
                            )}">${orden.estado}</span>
                        </div>
                        <div><strong>Prioridad:</strong> ${
                          orden.prioridad
                        }</div>
                        <div><strong>Fecha Ingreso:</strong> ${formatDate(
                          orden.fechaIngreso
                        )}</div>
                        <div><strong>Tiempo Atención:</strong> ${
                          orden.tiempoAtencion
                        } horas</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem;">Información del Producto</h4>
                    <div style="background: var(--bg); padding: 1rem; border-radius: 8px;">
                        <p><strong>Producto:</strong> ${
                          producto
                            ? producto.marca + " " + producto.modelo
                            : "-"
                        }</p>
                        <p><strong>N° Serie:</strong> ${
                          producto ? producto.numSerie : "-"
                        }</p>
                        <p><strong>Cliente:</strong> ${
                          cliente
                            ? cliente.nombres + " " + cliente.apellidos
                            : "-"
                        }</p>
                        <p><strong>Teléfono:</strong> ${
                          cliente ? cliente.telefono : "-"
                        }</p>
                        ${
                          garantia
                            ? '<p><strong>Garantía:</strong> <span class="badge badge-success">Vigente hasta ' +
                              formatDate(garantia.fechaFin) +
                              "</span></p>"
                            : ""
                        }
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem;">Problema Reportado</h4>
                    <div style="background: var(--bg); padding: 1rem; border-radius: 8px;">
                        ${orden.problemaReportado}
                    </div>
                </div>
                
                ${
                  orden.diagnostico
                    ? `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem;">Diagnóstico</h4>
                    <div style="background: var(--bg); padding: 1rem; border-radius: 8px;">
                        ${orden.diagnostico}
                    </div>
                </div>
                `
                    : ""
                }
                
                ${
                  orden.reparacion
                    ? `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem;">Reparación Realizada</h4>
                    <div style="background: var(--bg); padding: 1rem; border-radius: 8px;">
                        ${orden.reparacion}
                    </div>
                </div>
                `
                    : ""
                }
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem;">Costos</h4>
                    <div style="background: var(--bg); padding: 1rem; border-radius: 8px;">
                        <p><strong>Repuestos:</strong> ${
                          orden.repuestos || "Ninguno"
                        }</p>
                        <p><strong>Costo Repuestos:</strong> S/ ${orden.costoRepuestos.toFixed(
                          2
                        )}</p>
                        <p><strong>Costo Mano de Obra:</strong> S/ ${orden.costoMano.toFixed(
                          2
                        )}</p>
                        <p style="font-size: 1.2rem; margin-top: 0.5rem;"><strong>Total:</strong> S/ ${costoTotal.toFixed(
                          2
                        )}</p>
                    </div>
                </div>
                
                ${
                  orden.historial && orden.historial.length > 0
                    ? `
                <div>
                    <h4 style="margin-bottom: 0.5rem;">Historial</h4>
                    <div class="timeline">
                        ${orden.historial
                          .map(
                            (h) => `
                            <div class="timeline-item">
                                <div class="timeline-content">
                                    <div class="timeline-date">${formatDateTime(
                                      h.fecha
                                    )}</div>
                                    <div class="timeline-title">${
                                      h.estado
                                    }</div>
                                    ${
                                      h.nota
                                        ? '<p style="margin-top: 0.25rem; color: var(--text-light);">' +
                                          h.nota +
                                          "</p>"
                                        : ""
                                    }
                                </div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
                `
                    : ""
                }
            `;

  document.getElementById("detalleOrdenContent").innerHTML = content;
  document.getElementById("modalDetalleOrden").classList.add("active");
}

function editOrden(id) {
  const orden = ordenes.find((o) => o.id === id);
  if (!orden) return;

  const nuevoEstado = prompt(
    "Nuevo estado:\n1. Recibido\n2. En Diagnóstico\n3. En Reparación\n4. Esperando Repuesto\n5. Reparado\n6. Entregado\n\nIngrese el número:"
  );

  const estados = [
    "Recibido",
    "En Diagnóstico",
    "En Reparación",
    "Esperando Repuesto",
    "Reparado",
    "Entregado",
  ];
  const index = parseInt(nuevoEstado) - 1;

  if (index >= 0 && index < estados.length) {
    orden.estado = estados[index];
    orden.historial.push({
      fecha: new Date().toISOString(),
      estado: estados[index],
      nota: "Estado actualizado",
    });
    saveData();
    renderOrdenes();
    updateDashboard();
    alert("Estado actualizado correctamente");
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Delete Functions
function deleteCliente(id) {
  if (confirm("¿Está seguro de eliminar este cliente?")) {
    clientes = clientes.filter((c) => c.id !== id);
    saveData();
    renderClientes();
    updateSelects();
  }
}

function deleteProducto(id) {
  if (confirm("¿Está seguro de eliminar este producto?")) {
    productos = productos.filter((p) => p.id !== id);
    saveData();
    renderProductos();
    updateSelects();
  }
}

// Utility Functions
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEstadoClass(estado) {
  const classes = {
    Recibido: "badge-info",
    "En Diagnóstico": "badge-warning",
    "En Reparación": "badge-warning",
    "Esperando Repuesto": "badge-danger",
    Reparado: "badge-success",
    Entregado: "badge-success",
  };
  return classes[estado] || "badge-info";
}

// Storage Functions
function saveData() {
  const data = {
    clientes,
    productos,
    garantias,
    ordenes,
    ordenCounter,
  };
  localStorage.setItem("servicioTecnicoData", JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem("servicioTecnicoData");
  if (saved) {
    const data = JSON.parse(saved);
    clientes = data.clientes || [];
    productos = data.productos || [];
    garantias = data.garantias || [];
    ordenes = data.ordenes || [];
    ordenCounter = data.ordenCounter || 1;

    renderClientes();
    renderProductos();
    renderGarantias();
    renderOrdenes();
    updateSelects();
    updateDashboard();
  }
}

// Search listeners
document
  .getElementById("searchCliente")
  .addEventListener("input", renderClientes);
document
  .getElementById("searchProducto")
  .addEventListener("input", renderProductos);
document
  .getElementById("searchGarantia")
  .addEventListener("input", renderGarantias);
document.getElementById("searchOrden").addEventListener("input", renderOrdenes);
document
  .getElementById("filterEstado")
  .addEventListener("change", renderOrdenes);

// Close modal on outside click
window.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("active");
  }
});
