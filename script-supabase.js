// Aplicación principal con Supabase
let clientes = [];
let productos = [];
let garantias = [];
let ordenes = [];

// Initialize
document.addEventListener("DOMContentLoaded", async function () {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("fechaCompra").value = today;
  document.getElementById("fechaIngreso").value = today;
  document.getElementById("fechaInicio").value = today;

  try {
    // Mostrar loading
    showLoading();

    // Inicializar base de datos
    await dbService.init();

    // Cargar datos
    await loadAllData();

    // Actualizar interfaz
    updateDashboard();

    hideLoading();
    console.log("✅ Aplicación inicializada correctamente");
  } catch (error) {
    hideLoading();
    console.error("❌ Error inicializando aplicación:", error);
    alert(
      "Error conectando con la base de datos. Revisa la consola para más detalles."
    );
  }
});

// Loading functions
function showLoading() {
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loading";
  loadingDiv.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;">
      <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
        <div style="margin-bottom: 10px;">Conectando con la base de datos...</div>
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(loadingDiv);
}

function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) loading.remove();
}

// Data loading functions
async function loadAllData() {
  try {
    const [clientesData, productosData, garantiasData, ordenesData] =
      await Promise.all([
        dbService.getClientes(),
        dbService.getProductos(),
        dbService.getGarantias(),
        dbService.getOrdenes(),
      ]);

    // Convertir datos de Supabase al formato de la aplicación
    clientes = clientesData.map((c) => ({
      id: c.id,
      tipoDoc: c.tipo_doc,
      numDoc: c.num_doc,
      nombres: c.nombres,
      apellidos: c.apellidos,
      telefono: c.telefono,
      email: c.email,
      direccion: c.direccion,
    }));

    productos = productosData.map((p) => ({
      id: p.id,
      clienteId: p.cliente_id,
      tipoComprobante: p.tipo_comprobante,
      numComprobante: p.num_comprobante,
      fechaCompra: p.fecha_compra,
      categoria: p.categoria,
      marca: p.marca,
      modelo: p.modelo,
      numSerie: p.num_serie,
      descripcion: p.descripcion,
    }));

    garantias = garantiasData.map((g) => ({
      id: g.id,
      productoId: g.producto_id,
      tipo: g.tipo,
      fechaInicio: g.fecha_inicio,
      fechaFin: g.fecha_fin,
      duracionMeses: g.duracion_meses,
      terminos: g.terminos,
    }));

    ordenes = ordenesData.map((o) => ({
      id: o.id,
      numOrden: o.num_orden,
      productoId: o.producto_id,
      fechaIngreso: o.fecha_ingreso,
      estado: o.estado,
      prioridad: o.prioridad,
      problemaReportado: o.problema_reportado,
      diagnostico: o.diagnostico,
      reparacion: o.reparacion,
      repuestos: o.repuestos,
      costoRepuestos: o.costo_repuestos,
      costoMano: o.costo_mano,
      tiempoAtencion: o.tiempo_atencion,
      historial: o.historial,
    }));

    renderClientes();
    renderProductos();
    renderGarantias();
    renderOrdenes();
    updateSelects();
  } catch (error) {
    console.error("Error cargando datos:", error);
    throw error;
  }
}

// Navigation
function showView(viewId) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Mostrar la vista seleccionada
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  }
  
  // Actualizar botones de navegación
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Activar el botón correspondiente
  const activeBtn = document.querySelector(`.nav-btn[onclick*="${viewId}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Cerrar menú móvil si está abierto
  const nav = document.getElementById("mainNav");
  if (nav && nav.classList.contains("mobile-open")) {
    closeMobileMenu();
  }
}

// Cliente Form
document
  .getElementById("formCliente")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const cliente = {
        tipoDoc: document.getElementById("tipoDoc").value,
        numDoc: document.getElementById("numDoc").value,
        nombres: document.getElementById("nombres").value,
        apellidos: document.getElementById("apellidos").value,
        telefono: document.getElementById("telefono").value,
        email: document.getElementById("email").value,
        direccion: document.getElementById("direccion").value,
      };

      const nuevoCliente = await dbService.createCliente(cliente);

      // Convertir a formato de la aplicación
      const clienteFormatted = {
        id: nuevoCliente.id,
        tipoDoc: nuevoCliente.tipo_doc,
        numDoc: nuevoCliente.num_doc,
        nombres: nuevoCliente.nombres,
        apellidos: nuevoCliente.apellidos,
        telefono: nuevoCliente.telefono,
        email: nuevoCliente.email,
        direccion: nuevoCliente.direccion,
      };

      clientes.push(clienteFormatted);
      this.reset();
      renderClientes();
      updateSelects();
      alert("Cliente registrado exitosamente");
    } catch (error) {
      console.error("Error creando cliente:", error);
      alert("Error al registrar cliente: " + error.message);
    }
  });

// Producto Form
document
  .getElementById("formProducto")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const producto = {
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

      const nuevoProducto = await dbService.createProducto(producto);

      // Convertir a formato de la aplicación
      const productoFormatted = {
        id: nuevoProducto.id,
        clienteId: nuevoProducto.cliente_id,
        tipoComprobante: nuevoProducto.tipo_comprobante,
        numComprobante: nuevoProducto.num_comprobante,
        fechaCompra: nuevoProducto.fecha_compra,
        categoria: nuevoProducto.categoria,
        marca: nuevoProducto.marca,
        modelo: nuevoProducto.modelo,
        numSerie: nuevoProducto.num_serie,
        descripcion: nuevoProducto.descripcion,
      };

      productos.push(productoFormatted);
      this.reset();
      renderProductos();
      updateSelects();
      alert("Producto registrado exitosamente");
    } catch (error) {
      console.error("Error creando producto:", error);
      alert("Error al registrar producto: " + error.message);
    }
  });

// Garantía Form
document
  .getElementById("formGarantia")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const fechaInicio = new Date(
        document.getElementById("fechaInicio").value
      );
      const duracion = parseInt(document.getElementById("duracionMeses").value);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setMonth(fechaFin.getMonth() + duracion);

      const garantia = {
        productoId: document.getElementById("garProducto").value,
        tipo: document.getElementById("tipoGarantia").value,
        fechaInicio: document.getElementById("fechaInicio").value,
        fechaFin: fechaFin.toISOString().split("T")[0],
        duracionMeses: duracion,
        terminos: document.getElementById("terminos").value,
      };

      const nuevaGarantia = await dbService.createGarantia(garantia);

      // Convertir a formato de la aplicación
      const garantiaFormatted = {
        id: nuevaGarantia.id,
        productoId: nuevaGarantia.producto_id,
        tipo: nuevaGarantia.tipo,
        fechaInicio: nuevaGarantia.fecha_inicio,
        fechaFin: nuevaGarantia.fecha_fin,
        duracionMeses: nuevaGarantia.duracion_meses,
        terminos: nuevaGarantia.terminos,
      };

      garantias.push(garantiaFormatted);
      this.reset();
      renderGarantias();
      alert("Garantía registrada exitosamente");
    } catch (error) {
      console.error("Error creando garantía:", error);
      alert("Error al registrar garantía: " + error.message);
    }
  });

// Orden Form
document
  .getElementById("formOrden")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const orden = {
        productoId: document.getElementById("ordenProducto").value,
        fechaIngreso: document.getElementById("fechaIngreso").value,
        estado: document.getElementById("estadoOrden").value,
        prioridad: document.getElementById("prioridad").value,
        problemaReportado: document.getElementById("problemaReportado").value,
        diagnostico: document.getElementById("diagnostico").value,
        reparacion: document.getElementById("reparacion").value,
        repuestos: document.getElementById("repuestos").value,
        costoRepuestos:
          parseFloat(document.getElementById("costoRepuestos").value) || 0,
        costoMano: parseFloat(document.getElementById("costoMano").value) || 0,
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

      const nuevaOrden = await dbService.createOrden(orden);

      // Convertir a formato de la aplicación
      const ordenFormatted = {
        id: nuevaOrden.id,
        numOrden: nuevaOrden.num_orden,
        productoId: nuevaOrden.producto_id,
        fechaIngreso: nuevaOrden.fecha_ingreso,
        estado: nuevaOrden.estado,
        prioridad: nuevaOrden.prioridad,
        problemaReportado: nuevaOrden.problema_reportado,
        diagnostico: nuevaOrden.diagnostico,
        reparacion: nuevaOrden.reparacion,
        repuestos: nuevaOrden.repuestos,
        costoRepuestos: nuevaOrden.costo_repuestos,
        costoMano: nuevaOrden.costo_mano,
        tiempoAtencion: nuevaOrden.tiempo_atencion,
        historial: nuevaOrden.historial,
      };

      ordenes.push(ordenFormatted);
      this.reset();
      renderOrdenes();
      updateDashboard();
      alert("Orden de servicio creada exitosamente");
    } catch (error) {
      console.error("Error creando orden:", error);
      alert("Error al crear orden de servicio: " + error.message);
    }
  });

// Render Functions (mantienen la misma lógica pero sin localStorage)
function renderClientes() {
  const tbody = document.getElementById("tablaClientes");
  const search = document.getElementById("searchCliente").value.toLowerCase();

  const filtered = clientes.filter(
    (c) =>
      (c.numDoc && c.numDoc.toLowerCase().includes(search)) ||
      (c.nombres &&
        c.apellidos &&
        (c.nombres + " " + c.apellidos).toLowerCase().includes(search)) ||
      (c.telefono && c.telefono.includes(search))
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
                    <td>${c.tipoDoc || ""}: ${c.numDoc || ""}</td>
                    <td>${c.nombres || ""} ${c.apellidos || ""}</td>
                    <td>${c.telefono || "-"}</td>
                    <td>${c.email || "-"}</td>
                    <td>
                        <button class="action-btn" onclick="viewCliente(${
                          c.id
                        })" title="Ver detalle">👁️</button>
                        <button class="action-btn" onclick="editCliente(${
                          c.id
                        })" title="Editar">✏️</button>
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

  const filtered = productos.filter((p) => {
    const cliente = clientes.find((c) => c.id == p.clienteId);
    return (
      (p.numSerie && p.numSerie.toLowerCase().includes(search)) ||
      (p.marca && p.marca.toLowerCase().includes(search)) ||
      (p.modelo && p.modelo.toLowerCase().includes(search)) ||
      (cliente &&
        cliente.numDoc &&
        cliente.numDoc.toLowerCase().includes(search)) ||
      (cliente &&
        cliente.nombres &&
        cliente.apellidos &&
        (cliente.nombres + " " + cliente.apellidos)
          .toLowerCase()
          .includes(search))
    );
  });

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
                        <td><strong>${p.numSerie || ""}</strong></td>
                        <td>${p.marca || ""} ${p.modelo || ""}<br><small>${
        p.categoria || ""
      }</small></td>
                        <td>${
                          cliente
                            ? (cliente.nombres || "") +
                              " " +
                              (cliente.apellidos || "")
                            : "-"
                        }</td>
                        <td>${p.tipoComprobante || ""} ${
        p.numComprobante || ""
      }</td>
                        <td>${formatDate(p.fechaCompra)}</td>
                        <td>
                            <button class="action-btn" onclick="viewProducto(${
                              p.id
                            })" title="Ver detalle">👁️</button>
                            <button class="action-btn" onclick="editProducto(${
                              p.id
                            })" title="Editar">✏️</button>
                            <button class="action-btn" onclick="exportBoleta(${
                              p.id
                            })" title="Exportar Boleta PDF">📄</button>
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
      (producto.numSerie && producto.numSerie.toLowerCase().includes(search)) ||
      (cliente &&
        cliente.numDoc &&
        cliente.numDoc.toLowerCase().includes(search)) ||
      (cliente &&
        cliente.nombres &&
        cliente.apellidos &&
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
                            ? (producto.marca || "") +
                              " " +
                              (producto.modelo || "")
                            : "-"
                        }<br><small>${
        producto ? producto.numSerie || "" : "-"
      }</small></td>
                        <td>${
                          cliente
                            ? (cliente.nombres || "") +
                              " " +
                              (cliente.apellidos || "")
                            : "-"
                        }</td>
                        <td>${g.tipo || ""}</td>
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
      (o.numOrden && o.numOrden.toLowerCase().includes(search)) ||
      (o.estado && o.estado.toLowerCase().includes(search)) ||
      (producto &&
        producto.numSerie &&
        producto.numSerie.toLowerCase().includes(search)) ||
      (cliente &&
        cliente.numDoc &&
        cliente.numDoc.toLowerCase().includes(search)) ||
      (cliente &&
        cliente.nombres &&
        cliente.apellidos &&
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
                        <td><strong>${o.numOrden || ""}</strong></td>
                        <td>${
                          producto
                            ? (producto.marca || "") +
                              " " +
                              (producto.modelo || "")
                            : "-"
                        }<br><small>${
        producto ? producto.numSerie || "" : "-"
      }</small></td>
                        <td>${
                          cliente
                            ? (cliente.nombres || "") +
                              " " +
                              (cliente.apellidos || "")
                            : "-"
                        }</td>
                        <td><span class="badge ${estadoClass}">${
        o.estado || ""
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
                            <button class="action-btn" onclick="exportOrdenPDF(${
                              o.id
                            })" title="Exportar PDF">📄</button>
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
                        <td><strong>${o.numOrden || ""}</strong></td>
                        <td>${
                          cliente
                            ? (cliente.nombres || "") +
                              " " +
                              (cliente.apellidos || "")
                            : "-"
                        }</td>
                        <td>${
                          producto
                            ? (producto.marca || "") +
                              " " +
                              (producto.modelo || "")
                            : "-"
                        }</td>
                        <td><span class="badge ${estadoClass}">${
        o.estado || ""
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
          `<option value="${c.id}">${c.nombres || ""} ${c.apellidos || ""} (${
            c.numDoc || ""
          })</option>`
      )
      .join("");

  // Update producto selects
  const garProductoSelect = document.getElementById("garProducto");
  const ordenProductoSelect = document.getElementById("ordenProducto");

  const productosOptions = productos
    .map((p) => {
      const cliente = clientes.find((c) => c.id == p.clienteId);
      return `<option value="${p.id}">${p.marca || ""} ${p.modelo || ""} - ${
        p.numSerie || ""
      } ${cliente ? "(" + (cliente.nombres || "") + ")" : ""}</option>`;
    })
    .join("");

  garProductoSelect.innerHTML =
    '<option value="">Seleccione un producto</option>' + productosOptions;
  ordenProductoSelect.innerHTML =
    '<option value="">Seleccione un producto</option>' + productosOptions;
}

async function updateDashboard() {
  try {
    const stats = await dbService.getDashboardStats();

    document.getElementById("statActivas").textContent = stats.activas;
    document.getElementById("statDiagnostico").textContent =
      stats.enDiagnostico;
    document.getElementById("statReparacion").textContent = stats.enReparacion;
    document.getElementById("statGarantias").textContent =
      stats.garantiasVigentes;
  } catch (error) {
    console.error("Error actualizando dashboard:", error);
  }
}

// Delete Functions con confirmación y llamada a la BD
async function deleteCliente(id) {
  if (confirm("¿Está seguro de eliminar este cliente?")) {
    try {
      await dbService.deleteCliente(id);
      clientes = clientes.filter((c) => c.id !== id);
      renderClientes();
      updateSelects();
      alert("Cliente eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      alert("Error al eliminar cliente: " + error.message);
    }
  }
}

async function deleteProducto(id) {
  if (confirm("¿Está seguro de eliminar este producto?")) {
    try {
      await dbService.deleteProducto(id);
      productos = productos.filter((p) => p.id !== id);
      renderProductos();
      updateSelects();
      alert("Producto eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Error al eliminar producto: " + error.message);
    }
  }
}

// Utility Functions (mantienen la misma lógica)
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

// Search listeners (mantienen la misma lógica)
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

// Funciones de modal
function showModal(content) {
  // Crear el modal si no existe
  let modal = document.getElementById("dynamicModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "dynamicModal";
    modal.className = "modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = content;
  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("dynamicModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

// Funciones para guardar cambios
async function saveOrdenChanges() {
  try {
    const ordenId = document.getElementById("editOrdenId").value;
    const estadoAnterior = ordenes.find((o) => o.id == ordenId).estado;
    const nuevoEstado = document.getElementById("editEstado").value;
    const nota =
      document.getElementById("editNota").value ||
      `Cambio de estado: ${estadoAnterior} → ${nuevoEstado}`;

    const ordenData = {
      estado: nuevoEstado,
      prioridad: document.getElementById("editPrioridad").value,
      problemaReportado: document.getElementById("editProblemaReportado").value,
      diagnostico: document.getElementById("editDiagnostico").value,
      reparacion: document.getElementById("editReparacion").value,
      repuestos: document.getElementById("editRepuestos").value,
      costoRepuestos:
        parseFloat(document.getElementById("editCostoRepuestos").value) || 0,
      costoMano:
        parseFloat(document.getElementById("editCostoMano").value) || 0,
      tiempoAtencion:
        parseFloat(document.getElementById("editTiempoAtencion").value) || 0,
      historial: [
        ...ordenes.find((o) => o.id == ordenId).historial,
        {
          fecha: new Date().toISOString(),
          estado: nuevoEstado,
          nota: nota,
        },
      ],
    };

    const ordenActualizada = await dbService.updateOrden(ordenId, ordenData);

    // Actualizar en el array local
    const index = ordenes.findIndex((o) => o.id == ordenId);
    if (index !== -1) {
      ordenes[index] = {
        id: ordenActualizada.id,
        numOrden: ordenActualizada.num_orden,
        productoId: ordenActualizada.producto_id,
        fechaIngreso: ordenActualizada.fecha_ingreso,
        estado: ordenActualizada.estado,
        prioridad: ordenActualizada.prioridad,
        problemaReportado: ordenActualizada.problema_reportado,
        diagnostico: ordenActualizada.diagnostico,
        reparacion: ordenActualizada.reparacion,
        repuestos: ordenActualizada.repuestos,
        costoRepuestos: ordenActualizada.costo_repuestos,
        costoMano: ordenActualizada.costo_mano,
        tiempoAtencion: ordenActualizada.tiempo_atencion,
        historial: ordenActualizada.historial,
      };
    }

    closeModal();
    renderOrdenes();
    updateDashboard();
    alert("Orden actualizada exitosamente");
  } catch (error) {
    console.error("Error actualizando orden:", error);
    alert("Error al actualizar la orden: " + error.message);
  }
}

async function saveProductoChanges() {
  try {
    const productoId = document.getElementById("editProductoId").value;

    const productoData = {
      clienteId: document.getElementById("editProdCliente").value,
      tipoComprobante: document.getElementById("editTipoComprobante").value,
      numComprobante: document.getElementById("editNumComprobante").value,
      fechaCompra: document.getElementById("editFechaCompra").value,
      categoria: document.getElementById("editCategoria").value,
      marca: document.getElementById("editMarca").value,
      modelo: document.getElementById("editModelo").value,
      numSerie: document.getElementById("editNumSerie").value,
      descripcion: document.getElementById("editDescripcionProd").value,
    };

    const productoActualizado = await dbService.updateProducto(
      productoId,
      productoData
    );

    // Actualizar en el array local
    const index = productos.findIndex((p) => p.id == productoId);
    if (index !== -1) {
      productos[index] = {
        id: productoActualizado.id,
        clienteId: productoActualizado.cliente_id,
        tipoComprobante: productoActualizado.tipo_comprobante,
        numComprobante: productoActualizado.num_comprobante,
        fechaCompra: productoActualizado.fecha_compra,
        categoria: productoActualizado.categoria,
        marca: productoActualizado.marca,
        modelo: productoActualizado.modelo,
        numSerie: productoActualizado.num_serie,
        descripcion: productoActualizado.descripcion,
      };
    }

    closeModal();
    renderProductos();
    updateSelects();
    alert("Producto actualizado exitosamente");
  } catch (error) {
    console.error("Error actualizando producto:", error);
    alert("Error al actualizar el producto: " + error.message);
  }
}

// Funciones de exportación PDF
function exportOrdenPDF(id) {
  const orden = ordenes.find((o) => o.id == id);
  if (!orden) {
    alert("Orden no encontrada");
    return;
  }

  const producto = productos.find((p) => p.id == orden.productoId);
  const cliente = producto
    ? clientes.find((c) => c.id == producto.clienteId)
    : null;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración del documento
    doc.setFont("helvetica");

    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text("TECNOLOGÍA TOTAL SAC", 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Servicio Técnico Especializado", 20, 32);
    doc.text("RUC: 20123456789", 20, 38);
    doc.text("Dirección: Av. 9 de diciembre 230, Ayacucho, Perú", 20, 44);
    doc.text("Teléfono: (+51) 906 889 113", 20, 50);

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);

    // Título del documento
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text("ORDEN DE SERVICIO TÉCNICO", 20, 68);

    // Información de la orden
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const fechaActual = new Date().toLocaleDateString("es-PE");

    doc.text(`Número de Orden: ${orden.numOrden}`, 20, 80);
    doc.text(`Fecha de Emisión: ${fechaActual}`, 140, 80);
    doc.text(`Fecha de Ingreso: ${formatDate(orden.fechaIngreso)}`, 20, 86);
    doc.text(`Estado: ${orden.estado}`, 140, 86);
    doc.text(`Prioridad: ${orden.prioridad}`, 20, 92);

    // Información del cliente
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("DATOS DEL CLIENTE", 20, 105);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (cliente) {
      doc.text(`Cliente: ${cliente.nombres} ${cliente.apellidos}`, 20, 115);
      doc.text(`Documento: ${cliente.tipoDoc} ${cliente.numDoc}`, 20, 121);
      doc.text(`Teléfono: ${cliente.telefono || "-"}`, 20, 127);
      doc.text(`Email: ${cliente.email || "-"}`, 20, 133);
      doc.text(`Dirección: ${cliente.direccion || "-"}`, 20, 139);
    }

    // Información del producto
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("DATOS DEL EQUIPO", 20, 152);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (producto) {
      doc.text(`Categoría: ${producto.categoria}`, 20, 162);
      doc.text(`Marca: ${producto.marca}`, 20, 168);
      doc.text(`Modelo: ${producto.modelo}`, 20, 174);
      doc.text(`Número de Serie: ${producto.numSerie}`, 20, 180);
      doc.text(`Descripción: ${producto.descripcion || "-"}`, 20, 186);
    }

    // Detalles del servicio
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("DETALLES DEL SERVICIO", 20, 199);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Problema reportado
    doc.text("Problema Reportado:", 20, 209);
    const problemaText = orden.problemaReportado || "No especificado";
    const problemaLines = doc.splitTextToSize(problemaText, 150);
    doc.text(problemaLines, 20, 215);

    let yPos = 215 + problemaLines.length * 6;

    // Diagnóstico
    if (orden.diagnostico) {
      doc.text("Diagnóstico:", 20, yPos + 8);
      const diagnosticoLines = doc.splitTextToSize(orden.diagnostico, 150);
      doc.text(diagnosticoLines, 20, yPos + 14);
      yPos += 14 + diagnosticoLines.length * 6;
    }

    // Reparación
    if (orden.reparacion) {
      doc.text("Reparación Realizada:", 20, yPos + 8);
      const reparacionLines = doc.splitTextToSize(orden.reparacion, 150);
      doc.text(reparacionLines, 20, yPos + 14);
      yPos += 14 + reparacionLines.length * 6;
    }

    // Repuestos
    if (orden.repuestos) {
      doc.text("Repuestos Utilizados:", 20, yPos + 8);
      const repuestosLines = doc.splitTextToSize(orden.repuestos, 150);
      doc.text(repuestosLines, 20, yPos + 14);
      yPos += 14 + repuestosLines.length * 6;
    }

    // Costos
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("COSTOS DEL SERVICIO", 20, yPos + 15);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Costo de Repuestos: S/ ${(orden.costoRepuestos || 0).toFixed(2)}`,
      20,
      yPos + 25
    );
    doc.text(
      `Costo de Mano de Obra: S/ ${(orden.costoMano || 0).toFixed(2)}`,
      20,
      yPos + 31
    );

    const total = (orden.costoRepuestos || 0) + (orden.costoMano || 0);
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.text(`TOTAL: S/ ${total.toFixed(2)}`, 20, yPos + 40);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Tiempo de Atención: ${orden.tiempoAtencion || 0} horas`,
      20,
      yPos + 50
    );

    // Pie de página
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      "Este documento es generado automáticamente por el sistema de gestión.",
      20,
      pageHeight - 20
    );
    doc.text(
      `Generado el: ${new Date().toLocaleString("es-PE")}`,
      20,
      pageHeight - 15
    );

    // Guardar el PDF
    doc.save(`Orden_Servicio_${orden.numOrden}.pdf`);
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert(
      "Error al generar el PDF. Asegúrate de que la librería jsPDF esté cargada correctamente."
    );
  }
}

function exportBoleta(id) {
  const producto = productos.find((p) => p.id == id);
  if (!producto) {
    alert("Producto no encontrado");
    return;
  }

  const cliente = clientes.find((c) => c.id == producto.clienteId);

  // Buscar la orden de servicio asociada al producto para obtener los costos
  const ordenServicio = ordenes.find((o) => o.productoId == producto.id);
  const costoRepuestos = ordenServicio ? ordenServicio.costoRepuestos || 0 : 0;
  const costoMano = ordenServicio ? ordenServicio.costoMano || 0 : 0;
  const precioTotal = costoRepuestos + costoMano;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración del documento
    doc.setFont("helvetica");

    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text("TECNOLOGÍA TOTAL SAC", 20, 25);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("RUC: 20123456789", 20, 32);
    doc.text("Av. 9 de diciembre 230, Ayacucho, Perú", 20, 38);
    doc.text("Teléfono: (+51) 906 889 113", 20, 44);

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);

    // Título del documento
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text(`${producto.tipoComprobante.toUpperCase()} DE VENTA`, 20, 63);

    // Información del comprobante
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const fechaActual = new Date().toLocaleDateString("es-PE");

    doc.text(`${producto.tipoComprobante}: ${producto.numComprobante}`, 20, 75);
    doc.text(`Fecha de Emisión: ${fechaActual}`, 120, 75);
    doc.text(`Fecha de Compra: ${formatDate(producto.fechaCompra)}`, 20, 81);

    // Datos del cliente
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("DATOS DEL CLIENTE", 20, 94);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (cliente) {
      doc.text(`Cliente: ${cliente.nombres} ${cliente.apellidos}`, 20, 104);
      doc.text(`${cliente.tipoDoc}: ${cliente.numDoc}`, 20, 110);
      doc.text(`Teléfono: ${cliente.telefono || "-"}`, 20, 116);
      doc.text(`Dirección: ${cliente.direccion || "-"}`, 20, 122);
    }

    // Tabla de productos
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("DETALLE DEL SERVICIO", 20, 135);

    // Encabezado de tabla
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(0, 102, 204);
    doc.rect(20, 142, 170, 8, "F");
    doc.text("DESCRIPCIÓN", 22, 148);
    doc.text("CANT.", 120, 148);
    doc.text("PRECIO UNIT.", 145, 148);
    doc.text("TOTAL", 175, 148);

    // Contenido de tabla
    doc.setTextColor(0, 0, 0);
    const descripcion = `Servicio Técnico - ${producto.categoria} ${producto.marca} ${producto.modelo}`;
    doc.text(descripcion, 22, 158);
    doc.text("N/S: " + producto.numSerie, 22, 164);
    doc.text("1", 125, 158);

    // Mostrar el precio total del servicio
    if (precioTotal > 0) {
      doc.text(`S/ ${precioTotal.toFixed(2)}`, 145, 158);
      doc.text(`S/ ${precioTotal.toFixed(2)}`, 170, 158);
    } else {
      doc.text("S/ 0.00", 145, 158);
      doc.text("S/ 0.00", 170, 158);
    }

    if (producto.descripcion) {
      const descLines = doc.splitTextToSize(producto.descripcion, 95);
      doc.text(descLines, 22, 170);
    }

    // Desglose de costos (si hay una orden de servicio)
    let yPos = 180;
    if (ordenServicio && precioTotal > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 204);
      doc.text("DESGLOSE DE COSTOS", 20, yPos + 10);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `• Costo de Repuestos: S/ ${costoRepuestos.toFixed(2)}`,
        20,
        yPos + 20
      );
      doc.text(
        `• Costo de Mano de Obra: S/ ${costoMano.toFixed(2)}`,
        20,
        yPos + 26
      );

      // Línea separadora
      doc.setLineWidth(0.3);
      doc.line(130, yPos + 30, 190, yPos + 30);

      doc.setFontSize(12);
      doc.setTextColor(0, 102, 204);
      doc.text(`TOTAL A PAGAR: S/ ${precioTotal.toFixed(2)}`, 130, yPos + 38);

      yPos += 50;
    } else {
      // Línea separadora
      doc.line(20, yPos, 190, yPos);
      yPos += 10;
    }

    // Observaciones
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.text("OBSERVACIONES", 20, yPos + 3);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      "• Este comprobante es válido para reclamos de garantía.",
      20,
      yPos + 13
    );
    doc.text(
      "• Conserve este documento para futuros servicios técnicos.",
      20,
      yPos + 19
    );
    doc.text(
      "• La garantía cubre defectos de fabricación según términos y condiciones.",
      20,
      yPos + 25
    );

    // Pie de página
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      "Gracias por su preferencia - Tecnología Total SAC",
      20,
      pageHeight - 25
    );
    doc.text(
      `Documento generado el: ${new Date().toLocaleString("es-PE")}`,
      20,
      pageHeight - 15
    );

    // Guardar el PDF
    doc.save(`${producto.tipoComprobante}_${producto.numComprobante}.pdf`);
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert(
      "Error al generar el PDF. Asegúrate de que la librería jsPDF esté cargada correctamente."
    );
  }
}

// Funciones de vista y edición
function viewCliente(id) {
  const cliente = clientes.find((c) => c.id == id);
  if (!cliente) {
    alert("Cliente no encontrado");
    return;
  }

  const content = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Detalle del Cliente</h2>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="detail-grid">
          <div class="detail-item">
            <label>Tipo de Documento:</label>
            <span>${cliente.tipoDoc}</span>
          </div>
          <div class="detail-item">
            <label>Número de Documento:</label>
            <span>${cliente.numDoc}</span>
          </div>
          <div class="detail-item">
            <label>Nombres:</label>
            <span>${cliente.nombres}</span>
          </div>
          <div class="detail-item">
            <label>Apellidos:</label>
            <span>${cliente.apellidos}</span>
          </div>
          <div class="detail-item">
            <label>Teléfono:</label>
            <span>${cliente.telefono || "-"}</span>
          </div>
          <div class="detail-item">
            <label>Email:</label>
            <span>${cliente.email || "-"}</span>
          </div>
          <div class="detail-item">
            <label>Dirección:</label>
            <span>${cliente.direccion || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  showModal(content);
}

function editCliente(id) {
  const cliente = clientes.find((c) => c.id == id);
  if (!cliente) {
    alert("Cliente no encontrado");
    return;
  }

  const content = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Editar Cliente</h2>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <form id="editClienteForm">
          <div class="form-row">
            <div class="form-group">
              <label for="editTipoDoc">Tipo de Documento:</label>
              <select id="editTipoDoc" required>
                <option value="DNI" ${
                  cliente.tipoDoc === "DNI" ? "selected" : ""
                }>DNI</option>
                <option value="CE" ${
                  cliente.tipoDoc === "CE" ? "selected" : ""
                }>Carné de Extranjería</option>
                <option value="RUC" ${
                  cliente.tipoDoc === "RUC" ? "selected" : ""
                }>RUC</option>
                <option value="Pasaporte" ${
                  cliente.tipoDoc === "Pasaporte" ? "selected" : ""
                }>Pasaporte</option>
              </select>
            </div>

            <div class="form-group">
              <label for="editNumDoc">Número de Documento:</label>
              <input type="text" id="editNumDoc" value="${
                cliente.numDoc
              }" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editNombres">Nombres:</label>
              <input type="text" id="editNombres" value="${
                cliente.nombres
              }" required>
            </div>

            <div class="form-group">
              <label for="editApellidos">Apellidos:</label>
              <input type="text" id="editApellidos" value="${
                cliente.apellidos
              }" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editTelefono">Teléfono:</label>
              <input type="tel" id="editTelefono" value="${
                cliente.telefono || ""
              }">
            </div>

            <div class="form-group">
              <label for="editEmail">Email:</label>
              <input type="email" id="editEmail" value="${cliente.email || ""}">
            </div>
          </div>

          <div class="form-group">
            <label for="editDireccion">Dirección:</label>
            <textarea id="editDireccion" rows="3">${
              cliente.direccion || ""
            }</textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  `;

  showModal(content);

  // Agregar event listener al formulario
  document
    .getElementById("editClienteForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      await saveClienteChanges(id);
    });
}

async function saveClienteChanges(id) {
  const tipoDoc = document.getElementById("editTipoDoc").value;
  const numDoc = document.getElementById("editNumDoc").value;
  const nombres = document.getElementById("editNombres").value;
  const apellidos = document.getElementById("editApellidos").value;
  const telefono = document.getElementById("editTelefono").value;
  const email = document.getElementById("editEmail").value;
  const direccion = document.getElementById("editDireccion").value;

  if (!tipoDoc || !numDoc || !nombres || !apellidos) {
    alert("Por favor complete todos los campos obligatorios");
    return;
  }

  try {
    const { error } = await supabase
      .from("clientes")
      .update({
        tipo_doc: tipoDoc,
        num_doc: numDoc,
        nombres: nombres,
        apellidos: apellidos,
        telefono: telefono || null,
        email: email || null,
        direccion: direccion || null,
      })
      .eq("id", id);

    if (error) throw error;

    // Actualizar en el array local
    const clienteIndex = clientes.findIndex((c) => c.id == id);
    if (clienteIndex !== -1) {
      clientes[clienteIndex] = {
        ...clientes[clienteIndex],
        tipoDoc: tipoDoc,
        numDoc: numDoc,
        nombres: nombres,
        apellidos: apellidos,
        telefono: telefono,
        email: email,
        direccion: direccion,
      };
    }

    closeModal();
    renderClientes();
    alert("Cliente actualizado exitosamente");
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    alert("Error al actualizar el cliente: " + error.message);
  }
}

function viewProducto(id) {
  const producto = productos.find((p) => p.id == id);
  if (!producto) {
    alert("Producto no encontrado");
    return;
  }

  const cliente = clientes.find((c) => c.id == producto.clienteId);

  const content = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Detalle del Producto</h2>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="detail-grid">
          <div class="detail-item">
            <label>Cliente:</label>
            <span>${
              cliente ? `${cliente.nombres} ${cliente.apellidos}` : "-"
            }</span>
          </div>
          <div class="detail-item">
            <label>Categoría:</label>
            <span>${producto.categoria}</span>
          </div>
          <div class="detail-item">
            <label>Marca:</label>
            <span>${producto.marca}</span>
          </div>
          <div class="detail-item">
            <label>Modelo:</label>
            <span>${producto.modelo}</span>
          </div>
          <div class="detail-item">
            <label>Número de Serie:</label>
            <span>${producto.numSerie}</span>
          </div>
          <div class="detail-item">
            <label>Tipo de Comprobante:</label>
            <span>${producto.tipoComprobante}</span>
          </div>
          <div class="detail-item">
            <label>Número de Comprobante:</label>
            <span>${producto.numComprobante}</span>
          </div>
          <div class="detail-item">
            <label>Fecha de Compra:</label>
            <span>${formatDate(producto.fechaCompra)}</span>
          </div>
          <div class="detail-item">
            <label>Descripción:</label>
            <span>${producto.descripcion || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  showModal(content);
}

function viewOrden(id) {
  const orden = ordenes.find((o) => o.id == id);
  if (!orden) {
    alert("Orden no encontrada");
    return;
  }

  const producto = productos.find((p) => p.id == orden.productoId);
  const cliente = producto
    ? clientes.find((c) => c.id == producto.clienteId)
    : null;

  const content = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Detalle de la Orden - ${orden.numOrden}</h2>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="detail-grid">
          <div class="detail-item">
            <label>Número de Orden:</label>
            <span>${orden.numOrden}</span>
          </div>
          <div class="detail-item">
            <label>Cliente:</label>
            <span>${
              cliente ? `${cliente.nombres} ${cliente.apellidos}` : "-"
            }</span>
          </div>
          <div class="detail-item">
            <label>Producto:</label>
            <span>${
              producto ? `${producto.marca} ${producto.modelo}` : "-"
            }</span>
          </div>
          <div class="detail-item">
            <label>Número de Serie:</label>
            <span>${producto ? producto.numSerie : "-"}</span>
          </div>
          <div class="detail-item">
            <label>Estado:</label>
            <span class="badge ${getEstadoClass(orden.estado)}">${
    orden.estado
  }</span>
          </div>
          <div class="detail-item">
            <label>Prioridad:</label>
            <span>${orden.prioridad}</span>
          </div>
          <div class="detail-item">
            <label>Fecha de Ingreso:</label>
            <span>${formatDate(orden.fechaIngreso)}</span>
          </div>
          <div class="detail-item">
            <label>Problema Reportado:</label>
            <span>${orden.problemaReportado || "-"}</span>
          </div>
          <div class="detail-item">
            <label>Diagnóstico:</label>
            <span>${orden.diagnostico || "-"}</span>
          </div>
          <div class="detail-item">
            <label>Reparación:</label>
            <span>${orden.reparacion || "-"}</span>
          </div>
          <div class="detail-item">
            <label>Repuestos:</label>
            <span>${orden.repuestos || "-"}</span>
          </div>
          <div class="detail-item">
            <label>Costo Repuestos:</label>
            <span>S/ ${orden.costoRepuestos || 0}</span>
          </div>
          <div class="detail-item">
            <label>Costo Mano de Obra:</label>
            <span>S/ ${orden.costoMano || 0}</span>
          </div>
          <div class="detail-item">
            <label>Tiempo de Atención:</label>
            <span>${orden.tiempoAtencion || 0} horas</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="editOrden(${id})">Editar Orden</button>
          <button class="btn btn-secondary" onclick="exportOrdenPDF(${id})">Exportar PDF</button>
        </div>
      </div>
    </div>
  `;

  showModal(content);
}

function editOrden(id) {
  const orden = ordenes.find((o) => o.id == id);
  if (!orden) {
    alert("Orden no encontrada");
    return;
  }

  const producto = productos.find((p) => p.id == orden.productoId);
  const cliente = producto
    ? clientes.find((c) => c.id == producto.clienteId)
    : null;

  const content = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Editar Orden - ${orden.numOrden}</h2>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <form id="editOrdenForm">
          <input type="hidden" id="editOrdenId" value="${orden.id}">
          
          <div class="form-group">
            <label>Cliente:</label>
            <span class="form-display">${
              cliente ? `${cliente.nombres} ${cliente.apellidos}` : "-"
            }</span>
          </div>
          
          <div class="form-group">
            <label>Producto:</label>
            <span class="form-display">${
              producto
                ? `${producto.marca} ${producto.modelo} - ${producto.numSerie}`
                : "-"
            }</span>
          </div>

          <div class="form-group">
            <label for="editEstado">Estado:</label>
            <select id="editEstado" required>
              <option value="Recibido" ${
                orden.estado === "Recibido" ? "selected" : ""
              }>Recibido</option>
              <option value="En Diagnóstico" ${
                orden.estado === "En Diagnóstico" ? "selected" : ""
              }>En Diagnóstico</option>
              <option value="En Reparación" ${
                orden.estado === "En Reparación" ? "selected" : ""
              }>En Reparación</option>
              <option value="Esperando Repuesto" ${
                orden.estado === "Esperando Repuesto" ? "selected" : ""
              }>Esperando Repuesto</option>
              <option value="Reparado" ${
                orden.estado === "Reparado" ? "selected" : ""
              }>Reparado</option>
              <option value="Entregado" ${
                orden.estado === "Entregado" ? "selected" : ""
              }>Entregado</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editPrioridad">Prioridad:</label>
            <select id="editPrioridad" required>
              <option value="Baja" ${
                orden.prioridad === "Baja" ? "selected" : ""
              }>Baja</option>
              <option value="Media" ${
                orden.prioridad === "Media" ? "selected" : ""
              }>Media</option>
              <option value="Alta" ${
                orden.prioridad === "Alta" ? "selected" : ""
              }>Alta</option>
              <option value="Urgente" ${
                orden.prioridad === "Urgente" ? "selected" : ""
              }>Urgente</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editProblemaReportado">Problema Reportado:</label>
            <textarea id="editProblemaReportado" rows="3">${
              orden.problemaReportado || ""
            }</textarea>
          </div>

          <div class="form-group">
            <label for="editDiagnostico">Diagnóstico:</label>
            <textarea id="editDiagnostico" rows="3">${
              orden.diagnostico || ""
            }</textarea>
          </div>

          <div class="form-group">
            <label for="editReparacion">Reparación Realizada:</label>
            <textarea id="editReparacion" rows="3">${
              orden.reparacion || ""
            }</textarea>
          </div>

          <div class="form-group">
            <label for="editRepuestos">Repuestos Utilizados:</label>
            <textarea id="editRepuestos" rows="2">${
              orden.repuestos || ""
            }</textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editCostoRepuestos">Costo Repuestos (S/):</label>
              <input type="number" id="editCostoRepuestos" step="0.01" min="0" value="${
                orden.costoRepuestos || 0
              }">
            </div>

            <div class="form-group">
              <label for="editCostoMano">Costo Mano de Obra (S/):</label>
              <input type="number" id="editCostoMano" step="0.01" min="0" value="${
                orden.costoMano || 0
              }">
            </div>
          </div>

          <div class="form-group">
            <label for="editTiempoAtencion">Tiempo de Atención (horas):</label>
            <input type="number" id="editTiempoAtencion" step="0.5" min="0" value="${
              orden.tiempoAtencion || 0
            }">
          </div>

          <div class="form-group">
            <label for="editNota">Nota del cambio:</label>
            <input type="text" id="editNota" placeholder="Ej: Actualización de estado a En Reparación">
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  `;

  showModal(content);

  // Agregar event listener al formulario
  document
    .getElementById("editOrdenForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      await saveOrdenChanges();
    });
}

function editProducto(id) {
  const producto = productos.find((p) => p.id == id);
  if (!producto) {
    alert("Producto no encontrado");
    return;
  }

  const content = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Editar Producto</h2>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <form id="editProductoForm">
          <input type="hidden" id="editProductoId" value="${producto.id}">
          
          <div class="form-group">
            <label for="editProdCliente">Cliente:</label>
            <select id="editProdCliente" required>
              ${clientes
                .map(
                  (c) =>
                    `<option value="${c.id}" ${
                      c.id == producto.clienteId ? "selected" : ""
                    }>${c.nombres} ${c.apellidos} (${c.numDoc})</option>`
                )
                .join("")}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editTipoComprobante">Tipo de Comprobante:</label>
              <select id="editTipoComprobante" required>
                <option value="Boleta" ${
                  producto.tipoComprobante === "Boleta" ? "selected" : ""
                }>Boleta</option>
                <option value="Factura" ${
                  producto.tipoComprobante === "Factura" ? "selected" : ""
                }>Factura</option>
                <option value="Ticket" ${
                  producto.tipoComprobante === "Ticket" ? "selected" : ""
                }>Ticket</option>
              </select>
            </div>

            <div class="form-group">
              <label for="editNumComprobante">Número de Comprobante:</label>
              <input type="text" id="editNumComprobante" value="${
                producto.numComprobante
              }" required>
            </div>
          </div>

          <div class="form-group">
            <label for="editFechaCompra">Fecha de Compra:</label>
            <input type="date" id="editFechaCompra" value="${
              producto.fechaCompra
            }" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editCategoria">Categoría:</label>
              <select id="editCategoria" required>
                <option value="Laptop" ${
                  producto.categoria === "Laptop" ? "selected" : ""
                }>Laptop</option>
                <option value="PC" ${
                  producto.categoria === "PC" ? "selected" : ""
                }>PC</option>
                <option value="Impresora" ${
                  producto.categoria === "Impresora" ? "selected" : ""
                }>Impresora</option>
                <option value="Monitor" ${
                  producto.categoria === "Monitor" ? "selected" : ""
                }>Monitor</option>
                <option value="Tablet" ${
                  producto.categoria === "Tablet" ? "selected" : ""
                }>Tablet</option>
                <option value="Celular" ${
                  producto.categoria === "Celular" ? "selected" : ""
                }>Celular</option>
                <option value="Otro" ${
                  producto.categoria === "Otro" ? "selected" : ""
                }>Otro</option>
              </select>
            </div>

            <div class="form-group">
              <label for="editMarca">Marca:</label>
              <input type="text" id="editMarca" value="${
                producto.marca
              }" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editModelo">Modelo:</label>
              <input type="text" id="editModelo" value="${
                producto.modelo
              }" required>
            </div>

            <div class="form-group">
              <label for="editNumSerie">Número de Serie:</label>
              <input type="text" id="editNumSerie" value="${
                producto.numSerie
              }" required>
            </div>
          </div>

          <div class="form-group">
            <label for="editDescripcionProd">Descripción:</label>
            <textarea id="editDescripcionProd" rows="3">${
              producto.descripcion || ""
            }</textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  `;

  showModal(content);

  // Agregar event listener al formulario
  document
    .getElementById("editProductoForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      await saveProductoChanges();
    });
}

// Función para manejar el menú hamburguesa responsive
function toggleMobileMenu() {
  const nav = document.getElementById("mainNav");
  const hamburger = document.querySelector(".hamburger");
  const overlay = document.getElementById("mobileOverlay");

  if (nav && hamburger && overlay) {
    nav.classList.toggle("mobile-open");
    hamburger.classList.toggle("active");
    overlay.classList.toggle("active");
  }
}

// Función para cerrar el menú móvil
function closeMobileMenu() {
  const nav = document.getElementById("mainNav");
  const hamburger = document.querySelector(".hamburger");
  const overlay = document.getElementById("mobileOverlay");

  if (nav && hamburger && overlay) {
    nav.classList.remove("mobile-open");
    hamburger.classList.remove("active");
    overlay.classList.remove("active");
  }
}

// Inicialización adicional para el menú responsive
document.addEventListener("DOMContentLoaded", function () {
  // Asegurar que las funciones globales estén disponibles
  window.toggleMobileMenu = toggleMobileMenu;
  window.closeMobileMenu = closeMobileMenu;
  
  // Debug info
  console.log("Menú responsive inicializado");
  console.log("toggleMobileMenu disponible:", typeof window.toggleMobileMenu);
  
  // Verificar elementos
  const nav = document.getElementById("mainNav");
  const hamburger = document.querySelector(".hamburger");
  const overlay = document.getElementById("mobileOverlay");
  
  console.log("Elementos encontrados:", {
    nav: !!nav,
    hamburger: !!hamburger,
    overlay: !!overlay
  });
});
