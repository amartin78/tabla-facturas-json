// Almacena las facturas que hayan sido filtradas por empresa o cif
var filtroEmpresas = new Array();

// Imprime una tabla que contiene facturas, admite filtrado de datos
function imprimir(gastos, filtro) {

    let arrTemporal;

    limpiarCampos(filtro);

    // El usuario desea imprimir todas las facturas
    if (filtro === "listado") {
        imprimirCabeceraTabla();
        imprimirTabla(gastos);
    // El usuario desea realizar una búsqueda específica 
    } else {
        let campoAFiltrar, atributoFactura, mensajeError;
        if (filtro === "empresa") {
            campoAFiltrar = document.getElementsByName("filtrarPorEmpresa")[0].value.trim();
            campoAFiltrar = campoAFiltrar.toLowerCase();
            atributoFactura = "EMPRESA";
            mensajeError = "La empresa no se corresponde con ningún registro en nuestra " +
                           "base de datos";
        } else if (filtro === "cif") {
            campoAFiltrar = document.getElementsByName("filtrarPorCIF")[0].value.trim();
            campoAFiltrar = campoAFiltrar.toLowerCase();
            atributoFactura = "CIF";
            mensajeError = "El CIF no se corresponde con ningún registro en nuestra " +
                           "base de datos";
        } else if (filtro === "filtrarPorGastoSup") {
            campoAFiltrar = document.getElementsByName("filtrarPorGastoSup")[0].value.trim();
            campoAFiltrar = parseFloat(campoAFiltrar);
            atributoFactura = "TOTALFACTURA";
            mensajeError = "Introduzca un importe a partir del cual se mostrarán las empresas " +
                           "cuyo gasto total es mayor";
        }
        
        // Se buscan los datos de acuerdo al criterio elegido en filtro
        arrTemporal = filtrar(gastos, filtro, atributoFactura, campoAFiltrar);
        // Los datos filtrados por empresa o cif se almacenan para el caso de que el 
        // cliente elija posteriormente calcular los totales
        if (filtro === "empresa" || filtro === "cif") {
            filtroEmpresas = arrTemporal;
        }

        // Si la búsqueda retorna datos, estos se imprimirán
        if (arrTemporal.length > 0) {
            imprimirCabeceraTabla();
            imprimirTabla(arrTemporal);
        } else {
            imprimirError(mensajeError);
        }
    }
}

// Limpia los campos de búsqueda según la elección del usuario
function limpiarCampos(filtro) {

    if (filtro === "empresa") {
        document.getElementsByName("filtrarPorCIF")[0].value = "";
        document.getElementsByName("filtrarPorGastoSup")[0].value = "";
    } else if (filtro === "cif") {
        document.getElementsByName("filtrarPorEmpresa")[0].value = "";
        document.getElementsByName("filtrarPorGastoSup")[0].value = "";
    } else if (filtro === "filtrarPorGastoSup") {
        document.getElementsByName("filtrarPorEmpresa")[0].value = "";
        document.getElementsByName("filtrarPorCIF")[0].value = "";
    } else if (filtro === "listado") {
        document.getElementsByName("filtrarPorEmpresa")[0].value = "";
        document.getElementsByName("filtrarPorCIF")[0].value = "";
        document.getElementsByName("filtrarPorGastoSup")[0].value = "";
    }
    document.getElementsByTagName("div")[2].innerHTML = "";
}

// Imprime la cabecera de la tabla
function imprimirCabeceraTabla() {

    document.getElementById("tabla-gastos").innerHTML +=
        "<table> <tr>" + 
        "<th>Empresa</th> <th>CIF</th> <th>Base</th> <th>IVA</th> <th>Total</th>" + 
        "</tr> </table>";
}

// Imprime el contenido de la tabla
function imprimirTabla(gastos) {

    let facturaCompleta, empresa, cif, base, iva, total;
    for (let i = 0; i < gastos.length; i++) {
        empresa = gastos[i]["EMPRESA"];
        cif = gastos[i]["CIF"];
        base = parseFloat(gastos[i]["BASEIMPONIBLE"]).toFixed(2);
        base = base.replace('.',',');
        iva = gastos[i]["%IVA"];
        total = parseFloat(gastos[i]["TOTALFACTURA"]).toFixed(2);
        total = total.replace('.',',');
        // Solo se imprime la factura si ninguno de los datos recogidos es nulo 
        facturaCompleta = esFacturaCompleta(empresa, cif, base, iva, total);
        if (facturaCompleta) {
            document.getElementsByTagName("table")[0].innerHTML += 
            "<tr>" + 
            "<td>" + empresa + "</td>" + 
            "<td>" + cif + "</td>" + 
            "<td>" + base + " €</td>" + 
            "<td>" + iva + "%</td>" + 
            "<td>" + total + " €</td>" + 
            "</tr>";
        }
    }
}

// Devuelve todas las empresas que cumplan el criterio elegido por el usuario en filtro
// Se puede filtrar por nombre, cif o importe superior a recibido en campoAFiltrar
function filtrar(gastos, filtro, atributoFactura, campoAFiltrar) {

    let campo;
    let indiceTemp = 0;
    let arrTemporal = new Array();
    for (let i = 0; i < gastos.length; i++) {
        // Se comprueba que la factura contenga la propiedad buscada
        if (atributoFactura in gastos[i]) {
            campo = gastos[i][atributoFactura];
            // Se filtra por importe superior al recibido por el usuario
            if (filtro === "filtrarPorGastoSup") {
                campo = parseFloat(campo);
                if (campo > campoAFiltrar) {
                    arrTemporal[indiceTemp] = gastos[i];
                    indiceTemp++;
                }
            // Se filtra por empresa o por cif
            } else {
                campo = campo.toLowerCase();
                if (campoAFiltrar === campo) {
                    arrTemporal[indiceTemp] = gastos[i];
                    indiceTemp++;
                }
            }
        }
    }
    return arrTemporal;
}

// Para todas las facturas de una empresa elegida por nombre o cif, imprime el total de 
// la base imponible, el iva total y el total facturado 
function imprimirTotales() {

    // Si se almacenaron las facturas al filtrar por empresa o cif
    if (filtroEmpresas.length > 0) {
        let totalBase = 0, totalIva = 0, totalFactura = 0;
        for (let i = 0; i < filtroEmpresas.length; i++) {
            totalBase += parseFloat(filtroEmpresas[i]["BASEIMPONIBLE"]);
            totalIva += parseFloat(filtroEmpresas[i]["CUOTAIVA"])
            totalFactura += parseFloat(filtroEmpresas[i]["TOTALFACTURA"]);
        }
        totalBase = totalBase.toFixed(2).replace('.', ',');
        totalIva = totalIva.toFixed(2).replace('.', ',');
        totalFactura = totalFactura.toFixed(2).replace('.', ',');
        document.getElementById("tabla-gastos").innerHTML +=
            "<div id='total-por-empresa'><ul>" +
            "<li>Total suma base: " + totalBase + " €</li>" +
            "<li>Total importe IVA: " + totalIva + " €</li>" +
            "<li>Total facturado: " + totalFactura + " €</li>" +
            "</ul></div>";
        filtroEmpresas = new Array();
    // Al no haber facturas, no se calculan los totales y se comunica al usuario
    } else {
        mensajeError = "Filtre por Empresa o CIF y luego pulse el botón " +
                       "\"Total gastado por empresa\"";
        imprimirError(mensajeError);
    }
}

// Comprueba que todos los campos de una factura tengan valor
// Devuelve true o false
function esFacturaCompleta(empresa, cif, base, iva, total) {

    let completa = true;
    if ((empresa === undefined) || 
        (cif === undefined) ||
        (base === undefined) ||
        (iva === undefined) ||
        (total === undefined)) {
            completa = false;
    }
    return completa;
}

// Imprime mensaje de error
function imprimirError(mensaje) {

    document.getElementsByTagName("div")[2].innerHTML = mensaje;
}

