// Database service layer para Supabase
class DatabaseService {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (!validateSupabaseConfig()) {
      throw new Error("Configuración de Supabase no válida");
    }

    initializeSupabase();

    if (!supabase) {
      throw new Error("No se pudo inicializar Supabase");
    }

    this.initialized = true;
    console.log("✅ Servicio de base de datos inicializado");
  }

  // CLIENTES
  async getClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async createCliente(cliente) {
    const { data, error } = await supabase
      .from("clientes")
      .insert([
        {
          tipo_doc: cliente.tipoDoc,
          num_doc: cliente.numDoc,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: cliente.direccion,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCliente(id) {
    const { error } = await supabase.from("clientes").delete().eq("id", id);

    if (error) throw error;
  }

  // PRODUCTOS
  async getProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select(
        `
                *,
                cliente:clientes(*)
            `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async createProducto(producto) {
    const { data, error } = await supabase
      .from("productos")
      .insert([
        {
          cliente_id: producto.clienteId,
          tipo_comprobante: producto.tipoComprobante,
          num_comprobante: producto.numComprobante,
          fecha_compra: producto.fechaCompra,
          categoria: producto.categoria,
          marca: producto.marca,
          modelo: producto.modelo,
          num_serie: producto.numSerie,
          descripcion: producto.descripcion,
        },
      ])
      .select(
        `
                *,
                cliente:clientes(*)
            `
      )
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProducto(id) {
    const { error } = await supabase.from("productos").delete().eq("id", id);

    if (error) throw error;
  }

  async updateProducto(id, producto) {
    const { data, error } = await supabase
      .from("productos")
      .update({
        cliente_id: producto.clienteId,
        tipo_comprobante: producto.tipoComprobante,
        num_comprobante: producto.numComprobante,
        fecha_compra: producto.fechaCompra,
        categoria: producto.categoria,
        marca: producto.marca,
        modelo: producto.modelo,
        num_serie: producto.numSerie,
        descripcion: producto.descripcion,
      })
      .eq("id", id)
      .select(
        `
                *,
                cliente:clientes(*)
            `
      )
      .single();

    if (error) throw error;
    return data;
  } // GARANTÍAS
  async getGarantias() {
    const { data, error } = await supabase
      .from("garantias")
      .select(
        `
                *,
                producto:productos(
                    *,
                    cliente:clientes(*)
                )
            `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async createGarantia(garantia) {
    const { data, error } = await supabase
      .from("garantias")
      .insert([
        {
          producto_id: garantia.productoId,
          tipo: garantia.tipo,
          fecha_inicio: garantia.fechaInicio,
          fecha_fin: garantia.fechaFin,
          duracion_meses: garantia.duracionMeses,
          terminos: garantia.terminos,
        },
      ])
      .select(
        `
                *,
                producto:productos(
                    *,
                    cliente:clientes(*)
                )
            `
      )
      .single();

    if (error) throw error;
    return data;
  }

  // ÓRDENES
  async getOrdenes() {
    const { data, error } = await supabase
      .from("ordenes")
      .select(
        `
                *,
                producto:productos(
                    *,
                    cliente:clientes(*)
                )
            `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async createOrden(orden) {
    // Primero obtener el siguiente número de orden
    const numeroOrden = await this.getNextOrdenNumber();

    const { data, error } = await supabase
      .from("ordenes")
      .insert([
        {
          num_orden: numeroOrden,
          producto_id: orden.productoId,
          fecha_ingreso: orden.fechaIngreso,
          estado: orden.estado,
          prioridad: orden.prioridad,
          problema_reportado: orden.problemaReportado,
          diagnostico: orden.diagnostico,
          reparacion: orden.reparacion,
          repuestos: orden.repuestos,
          costo_repuestos: orden.costoRepuestos,
          costo_mano: orden.costoMano,
          tiempo_atencion: orden.tiempoAtencion,
          historial: orden.historial,
        },
      ])
      .select(
        `
                *,
                producto:productos(
                    *,
                    cliente:clientes(*)
                )
            `
      )
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrden(id, orden) {
    const { data, error } = await supabase
      .from("ordenes")
      .update({
        estado: orden.estado,
        prioridad: orden.prioridad,
        problema_reportado: orden.problemaReportado,
        diagnostico: orden.diagnostico,
        reparacion: orden.reparacion,
        repuestos: orden.repuestos,
        costo_repuestos: orden.costoRepuestos,
        costo_mano: orden.costoMano,
        tiempo_atencion: orden.tiempoAtencion,
        historial: orden.historial,
      })
      .eq("id", id)
      .select(
        `
                *,
                producto:productos(
                    *,
                    cliente:clientes(*)
                )
            `
      )
      .single();

    if (error) throw error;
    return data;
  }

  async getNextOrdenNumber() {
    // Obtener el siguiente valor de la secuencia
    const { data, error } = await supabase.rpc("nextval", {
      sequence_name: "orden_counter_seq",
    });

    if (error) {
      // Si falla, usar un método alternativo
      const { data: ordenes } = await supabase
        .from("ordenes")
        .select("num_orden")
        .order("id", { ascending: false })
        .limit(1);

      let nextNumber = 1;
      if (ordenes && ordenes.length > 0) {
        const lastNumber = parseInt(ordenes[0].num_orden.replace("OS-", ""));
        nextNumber = lastNumber + 1;
      }

      return `OS-${String(nextNumber).padStart(5, "0")}`;
    }

    return `OS-${String(data).padStart(5, "0")}`;
  }

  // ESTADÍSTICAS PARA DASHBOARD
  async getDashboardStats() {
    try {
      const [ordenesData, garantiasData] = await Promise.all([
        this.getOrdenes(),
        this.getGarantias(),
      ]);

      const activas = ordenesData.filter(
        (o) => !["Entregado"].includes(o.estado)
      ).length;
      const enDiagnostico = ordenesData.filter(
        (o) => o.estado === "En Diagnóstico"
      ).length;
      const enReparacion = ordenesData.filter(
        (o) => o.estado === "En Reparación"
      ).length;
      const garantiasVigentes = garantiasData.filter(
        (g) => new Date(g.fecha_fin) >= new Date()
      ).length;

      return {
        activas,
        enDiagnostico,
        enReparacion,
        garantiasVigentes,
        ordenesRecientes: ordenesData.slice(0, 5),
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      throw error;
    }
  }
}

// Instancia global del servicio de base de datos
const dbService = new DatabaseService();
