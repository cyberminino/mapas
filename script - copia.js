
// Centro del mapa: Guanajuato capital
const center = ol.proj.fromLonLat([-101.2555, 21.0190]); // Coordenadas de Guanajuato, Gto.
// URLs de iconos locales (carpeta icons/)
const ICONS = {
    // PRIMARIA: 'icons/education40.png',
    PRIMARIA: 'https://raw.githubusercontent.com/cyberminino/mapas/main/educationblue40.png',
    SECUNDARIA: 'https://raw.githubusercontent.com/cyberminino/mapas/main/education40.png'
};
// Crear mapa
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: center,
        zoom: 8.5
    })
});

//
// Fuente vectorial para municipios
const municipiosSource = new ol.source.Vector({
    url: 'https://raw.githubusercontent.com/cyberminino/mapas/main/guanajuato_municipios.geojson',   // URL PARA EL GEOJSON
    format: new ol.format.GeoJSON()
});




// Paleta de colores por región
const regionColors = {
    1: 'rgba(255, 99, 132, 0.4)',
    2: 'rgba(54, 162, 235, 0.4)',
    3: 'rgba(255, 206, 86, 0.2)',
    4: 'rgba(75, 192, 192, 0.4)',
    5: 'rgba(153, 102, 255, 0.4)',
    6: 'rgba(255, 159, 64, 0.4)',
    7: 'rgba(199, 199, 199, 0.4)'
};

// Capa vectorial para municipios
const municipiosLayer = new ol.layer.Vector({
    source: municipiosSource,
    style: function (feature) {
        const region = feature.get('Region');
        const fillColor = regionColors[region] || 'rgba(0,0,0,0.1)';
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: fillColor
            }),
            stroke: new ol.style.Stroke({
                color: '#333',
                width: 1
            })
        });
    }
});

//END codigo para la división

// Vector Source para escuelas
const schoolsVectorSource = new ol.source.Vector();

// Capa vectorial para escuelas
const schoolsVectorLayer = new ol.layer.Vector({
    source: schoolsVectorSource,
    style: function (feature) {
        const nivel = feature.get('nivel');
        const iconSrc = ICONS[nivel];
        const rank = feature.get('Orden_Porcent_DR');

        const styles = [];

        // Icono principal
        if (iconSrc) {
            styles.push(new ol.style.Style({
                image: new ol.style.Icon({
                    src: iconSrc,
                    scale: 0.8,
                    anchor: [0.5, 1]
                })
            }));
        } else {
            styles.push(new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 6,
                    fill: new ol.style.Fill({ color: '#004B87' }),
                    stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
                })
            }));
        }

        // Texto de rank encima del icono
        if (rank !== undefined && rank !== null) {
            styles.push(new ol.style.Style({
                text: new ol.style.Text({
                    text: `${rank}`,
                    offsetY: -33, // posición del texto (arriba del marcador)
                    scale: 1.2,
                    fill: new ol.style.Fill({ color: '#4828d6' }), // Azul fuerte
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
                    font: 'bold 14px sans-serif'
                })
            }));
        }

        return styles;
    }

    // hasta aqui para lo de los iconos
});

map.addLayer(municipiosLayer);

map.addLayer(schoolsVectorLayer);
// Vector Source para ubicación del usuario
const userLocationVectorSource = new ol.source.Vector();
// Capa vectorial para ubicación del usuario
const userLocationVectorLayer = new ol.layer.Vector({
    source: userLocationVectorSource,
    style: new ol.style.Style({
        image: new ol.style.Icon({
            src: 'https://openlayers.org/en/latest/examples/data/icon.png', // Ícono válido
            scale: 0.7,
            anchor: [0.5, 1]
        })
    })
});
map.addLayer(userLocationVectorLayer);
// Variable global para guardar los datos cargados
let escuelas = [];
// Agregar marcadores al mapa (desde JSON)
function addMarkers(schools) {
    schoolsVectorSource.clear(); // Limpiar marcadores anteriores

    const zoom = map.getView().getZoom();
    if (zoom < 12) return; // No mostrar marcadores si el zoom es menor a 9

    const extent = map.getView().calculateExtent(map.getSize());

    schools.forEach(escuela => {
        const coord = ol.proj.fromLonLat(escuela.latlng);

        // Solo agregar si la coordenada está dentro del área visible
        if (!ol.extent.containsCoordinate(extent, coord)) return;

        const feature = new ol.Feature({
            geometry: new ol.geom.Point(coord)
        });

        feature.setProperties({
            clavect: escuela.clavect,
            nombre: escuela.nombre,
            turno: escuela.turno,
            alumnos: escuela.alumnos,
            Nivel_I: escuela.Esp_Nivel_I,
            Nivel_II: escuela.Esp_Nivel_II,
            nivel: escuela.nivel,
            Abandonantes: escuela.Abandonantes,
            Porcentaje_Español_I: escuela.Esp_PercentI,
            Porcentaje_Español_II: escuela.Esp_PercentII,
            Mat_Nivel_I: escuela.Mat_Nivel_I,
            Mat_Nivel_II: escuela.Mat_Nivel_II,
            Mat_PercentI: escuela.Mat_PercentI,
            Mat_PercentII: escuela.Mat_PercentII,
            Esp_Dom1: escuela.Esp_Dom1,
            Esp_Dom2: escuela.Esp_Dom2,
            Esp_Dom3: escuela.Esp_Dom3,
            Percent_EspDom1: escuela.Percent_EspDom1,
            Percent_EspDom2: escuela.Percent_EspDom2,
            Percent_EspDom3: escuela.Percent_EspDom3,
            Mat_Dom1: escuela.Mat_Dom1,
            Mat_Dom2: escuela.Mat_Dom2,
            Mat_Dom3: escuela.Mat_Dom3,
            Percent_MatDom1: escuela.Percent_MatDom1,
            Percent_MatDom2: escuela.Percent_MatDom2,
            Percent_MatDom3: escuela.Percent_MatDom3,
            Orden_Porcent_DR: escuela.Orden_Porcent_DR,
        });

        schoolsVectorSource.addFeature(feature);
    });
}



// Cargar datos desde DataEscuelas.json
async function loadSchoolsFromJSON() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/cyberminino/mapas/refs/heads/main/escuelas.json'); // archivo u url 
        escuelas = await response.json();
        addMarkers(escuelas); // Mostrar todas al inicio
    } catch (error) {
        console.error("Error al cargar el archivo JSON:", error);
        alert("No se pudo cargar el archivo DataEscuelas.json");
    }
}


// Popup
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');
const overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});
map.addOverlay(overlay);
closer.onclick = function () {
    overlay.setPosition(undefined);
    return false;
};

// Manejar clic en marcador
map.on('click', function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        return layer === schoolsVectorLayer ? feature : null; // Con esta ignoramos la capa de municipios para el evento de clic, asi no muestra undefined
    });
    if (feature) {
        const coord = feature.getGeometry().getCoordinates();
        const props = feature.getProperties();
        content.innerHTML = `
	  <div id="popup-content-table">
      <table class="table table-bordered table-striped table-sm popup-table">
      <tbody>
      <tr><th>Clave CT</th><td>${props.clavect}</td></tr>
      <tr><th>Nombre</th><td>${props.nombre}</td></tr>
      <tr><th>Turno</th><td>${props.turno}</td></tr>
      <tr><th>Total de estudiantes</th><td>${props.alumnos}*</td></tr>
      <tr><th>Estudiantes en situación de abandono</th><td>${props.Abandonantes}*</td></tr>

      <tr class="table-primary text-center"><th colspan="2">Alumnos por nivel de los resultados de logro</th></tr>
      <tr class="text-center font-weight-bold"><td>Español</td><td>Matemáticas</td></tr>
      <tr>
        <td>Nivel I: ${props.Nivel_I} estudiantes (${props.Porcentaje_Español_I}%)</td>
        <td>Nivel I: ${props.Mat_Nivel_I} estudiantes (${props.Mat_PercentI}%)</td>
      </tr>
      <tr>
        <td>Nivel II: ${props.Nivel_II} estudiantes (${props.Porcentaje_Español_II}%)</td>
        <td>Nivel II: ${props.Mat_Nivel_II} estudiantes (${props.Mat_PercentII}%)</td>
      </tr>

      <tr class="table-primary text-center"><th colspan="2">Comprensión Lectora</th></tr>
      <tr><td>Domina la comprensión lectora</td><td>${props.Esp_Dom1} estudiantes (${props.Percent_EspDom1}%)</td></tr>
      <tr><td>En proceso de comprensión lectora</td><td>${props.Esp_Dom2} estudiantes (${props.Percent_EspDom2}%)</td></tr>
      <tr><td>Sin comprensión lectora</td><td>${props.Esp_Dom3} estudiantes (${props.Percent_EspDom3}%)</td></tr>

      <tr class="table-primary text-center"><th colspan="2">Operaciones Matemáticas</th></tr>
      <tr><td>Dominan operaciones básicas</td><td>${props.Mat_Dom1} estudiantes (${props.Percent_MatDom1}%)</td></tr>
      <tr><td>En proceso de conocer operaciones básicas</td><td>${props.Mat_Dom2} estudiantes (${props.Percent_MatDom2}%)</td></tr>
      <tr><td>No resuelven operaciones básicas</td><td>${props.Mat_Dom3} estudiantes (${props.Percent_MatDom3}%)</td></tr>
      <tr class="table-secondary text-center"><td colspan="2"><em>Datos RIMA 2024</em></td></tr>
	  <tr class="footer-note"><td colspan="2"><em>* Datos control escolar ciclo 2024-2025</em></td></tr>
    </tbody>
  </table>
  </div>

  <div class="text-center my-2 popup-footer">
    <button class="btn btn-sm btn-outline-danger" onclick="descargarPDF('${props.clavect}')">
    <i class="bi bi-file-earmark-pdf"></i> Imprimir CCT
    </button>
  </div>
`;
        overlay.setPosition(coord);
    } else {
        overlay.setPosition(undefined);
    }
});
// Variables de filtro activo
let activeLevelFilter = 'all';
let activeShiftFilter = 'all';
// Filtrar por nivel educativo
function filterLevel(level) {
    activeLevelFilter = level;
    updateMap();
    highlightSelectedFilter('Nivel', level);
    closeFilters();
    closeMobileFilters(); // Cerrar la lista de filtros después de aplicar
    map.updateSize();
}
// Filtrar por turno
function filterShift(shift) {
    activeShiftFilter = shift;
    updateMap();
    highlightSelectedFilter('Turno', shift);
    closeFilters();
    closeMobileFilters(); // Cerrar la lista de filtros después de aplicar
    map.updateSize();
}
// Actualizar mapa según filtros
function updateMap() {
    const filtered = escuelas.filter(escuela => {
        const matchLevel = activeLevelFilter === 'all' || escuela.nivel === activeLevelFilter;
        const matchShift = activeShiftFilter === 'all' || escuela.turno === activeShiftFilter;
        return matchLevel && matchShift;
    });
    addMarkers(filtered);
}
// Obtener ubicación del usuario
function getUserLocation() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = ''; // Limpiar mensaje de error
    if (!navigator.geolocation) {
        errorMessage.textContent = 'La geolocalización no está disponible en este navegador.';
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            // Centrar el mapa en la ubicación del usuario
            map.getView().setCenter(ol.proj.fromLonLat([longitude, latitude]));
            map.getView().setZoom(15);
            // Agregar un marcador en la ubicación del usuario
            userLocationVectorSource.clear(); // Limpiar marcadores anteriores de ubicación
            const userMarker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
            });
            userLocationVectorSource.addFeature(userMarker);
            closeFilters(); // Cerramos los filtros de una
            closeMobileFilters(); // Cierra filtro móvil si está abierto
            map.updateSize();
        },
        (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage.textContent = 'El usuario denegó el acceso a la ubicación.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage.textContent = 'La información de ubicación no está disponible.';
                    break;
                case error.TIMEOUT:
                    errorMessage.textContent = 'La solicitud de ubicación expiró.';
                    break;
                default:
                    errorMessage.textContent = 'Error desconocido al obtener la ubicación.';
                    break;
            }
        }
    );
}



// Función para alternar la visibilidad del contenedor de filtros
function toggleFilters() {
    const filterContainer = document.getElementById('filterContainer');
    filterContainer.classList.toggle('active'); // Alternar clase "active"
}
// Función para cerrar los filtros
function closeFilters() {
    const filterContainer = document.getElementById('filterContainer');
    filterContainer.classList.remove('active'); // Quitar clase "active"
}


// Búsqueda por ClaveCT
function searchSchoolByClaveCT(selectElementId) {
    const searchInput = document.getElementById(selectElementId).value.trim().toUpperCase();
    const searchErrorMessage = document.getElementById('searchErrorMessage');
    searchErrorMessage.textContent = ''; // Limpiar mensaje de error
    if (!searchInput) {
        searchErrorMessage.textContent = 'Por favor, ingresa una ClaveCT.';
        return;
    }

    const school = escuelas.find(escuela => escuela.clavect === searchInput);

    if (school) {
        const coordinates = ol.proj.fromLonLat(school.latlng);

        // Centrar el mapa
        map.getView().animate({
            center: coordinates,
            zoom: 16,
            duration: 500
        });

        // Mostrar popup después de que termine la animación
        setTimeout(() => {
            content.innerHTML = `
  <div id="popup-content-table">
      <table class="table table-bordered table-striped table-sm popup-table">
        <tbody>
          <tr><th>Clave CT</th><td>${school.clavect}</td></tr>
          <tr><th>Nombre</th><td>${school.nombre}</td></tr>
          <tr><th>Turno</th><td>${school.turno}</td></tr>
          <tr><th>Total de estudiantes</th><td>${school.alumnos}*</td></tr>
          <tr><th>Estudiantes en situación de abandono</th><td>${school.Abandonantes}*</td></tr>

          <tr class="table-primary text-center"><th colspan="2">Alumnos por nivel de los resultados de logro</th></tr>
          <tr class="subheader"><td>Español</td><td>Matemáticas</td></tr>
          <tr>
            <td>Nivel I: ${school.Esp_Nivel_I} (${school.Esp_PercentI}%)</td>
            <td>Nivel I: ${school.Mat_Nivel_I} (${school.Mat_PercentI}%)</td>
          </tr>
          <tr>
            <td>Nivel II: ${school.Esp_Nivel_II} (${school.Esp_PercentII}%)</td>
            <td>Nivel II: ${school.Mat_Nivel_II} (${school.Mat_PercentII}%)</td>
          </tr>

          <tr class="table-primary text-center"><th colspan="2">Comprensión Lectora</th></tr>
          <tr><td>Domina la comprensión lectora</td><td>${school.Esp_Dom1} (${school.Percent_EspDom1}%)</td></tr>
          <tr><td>En proceso de comprensión lectora</td><td>${school.Esp_Dom2} (${school.Percent_EspDom2}%)</td></tr>
          <tr><td>Sin comprensión lectora</td><td>${school.Esp_Dom3} (${school.Percent_EspDom3}%)</td></tr>

          <tr class="table-primary text-center"><th colspan="2">Operaciones Matemáticas</th></tr>
          <tr><td>Dominan operaciones básicas</td><td>${school.Mat_Dom1} (${school.Percent_MatDom1}%)</td></tr>
          <tr><td>En proceso de conocer operaciones básicas</td><td>${school.Mat_Dom2} (${school.Percent_MatDom2}%)</td></tr>
          <tr><td>No resuelven operaciones básicase</td><td>${school.Mat_Dom3} (${school.Percent_MatDom3}%)</td></tr>
          <tr class="footer-note"><td colspan="2"><em>Datos RIMA 2024</em></td></tr>
		  <tr class="footer-note"><td colspan="2"><em>* Datos control escolar 2025</em></td></tr>
        </tbody>
      </table>
	  </div>
  <div class="text-center mt-2">
    <button class="btn btn-sm btn-outline-danger" onclick="descargarPDF('${school.clavect}')">
      <i class="bi bi-file-earmark-pdf"></i> Imprimir CCT
    </button>
  </div>
`;


            overlay.setPosition(coordinates);
        }, 600); // 600ms para dar tiempo a la animación

        closeFilters(); // Cerrar filtros
        closeMobileFilters();
        map.updateSize();
    } else {
        searchErrorMessage.textContent = 'No se encontró ninguna escuela con la ClaveCT ingresada.';
    }
}

function loadMunicipios(selectElementId) {
    const municipioSelect = document.getElementById(selectElementId);
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Mostrar spinner inicialmente
    loadingSpinner.classList.remove('d-none');
    // Limpiar select y mostrar estado de carga
    municipioSelect.innerHTML = '';
    const loadingOption = document.createElement('option');
    loadingOption.value = '';
    loadingOption.textContent = 'Cargando municipios...';
    loadingOption.disabled = true;
    loadingOption.selected = true;
    municipioSelect.appendChild(loadingOption);
    municipioSelect.disabled = true;

    // Si ya hay features cargadas
    if (municipiosSource.getFeatures().length > 0) {
        fillMunicipioSelector(municipioSelect, municipiosSource.getFeatures());
        loadingSpinner.classList.add('d-none');
        return;
    }

    // Si aún no están cargadas, esperar evento
    const handleLoadEnd = function () {
        const features = municipiosSource.getFeatures();
        fillMunicipioSelector(municipioSelect, features);
        loadingSpinner.classList.add('d-none');
        municipiosSource.un('featuresloadend', handleLoadEnd); // Evitar duplicados
    };

    const handleLoadError = function () {
        municipioSelect.innerHTML = '';
        const errorOption = document.createElement('option');
        errorOption.value = '';
        errorOption.textContent = 'Error al cargar municipios';
        errorOption.disabled = true;
        errorOption.selected = true;
        municipioSelect.appendChild(errorOption);
        municipioSelect.disabled = true;
        loadingSpinner.classList.add('d-none');
        console.error("No se pudo cargar el GeoJSON de municipios");
        municipiosSource.un('featuresloaderror', handleLoadError);
    };

    municipiosSource.on('featuresloadend', handleLoadEnd);
    municipiosSource.on('featuresloaderror', handleLoadError);
}

// Función auxiliar para evitar repetir lógica
function fillMunicipioSelector(selectElement, features) {
    selectElement.innerHTML = ''; // Limpiar opciones previas

    if (features.length === 0) {
        const emptyOption = document.createElement('option');
        emptyOption.textContent = 'No se encontraron municipios';
        emptyOption.disabled = true;
        selectElement.appendChild(emptyOption);
        selectElement.disabled = true;
        return;
    }

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecciona un municipio';
    selectElement.appendChild(defaultOption);
    // cambiar el tipo de codificación al guardar el geojson
    const sortedFeatures = features.slice().sort((a, b) => {
        const nameA = a.get('NOMGEO').toLocaleUpperCase('es-MX');
        const nameB = b.get('NOMGEO').toLocaleUpperCase('es-MX');
        return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    });

    // Agregar opciones ordenadas
    sortedFeatures.forEach(feature => {
        const nombreMunicipio = feature.get('NOMGEO');
        const option = document.createElement('option');
        option.value = nombreMunicipio;
        option.textContent = nombreMunicipio;
        selectElement.appendChild(option);
    });

    selectElement.disabled = false;
}

// Centrar mapa en el municipio seleccionado
function centerOnMunicipio(selectorId) {
    const selectedMunicipio = document.getElementById(selectorId).value;
    if (!selectedMunicipio) return;

    const features = municipiosSource.getFeatures();
    const feature = features.find(f => f.get('NOMGEO') === selectedMunicipio);

    if (feature) {
        const geometry = feature.getGeometry();
        let coordinates = null;

        if (geometry instanceof ol.geom.Polygon) {
            coordinates = geometry.getInteriorPoint().getCoordinates();
        } else if (geometry instanceof ol.geom.MultiPolygon) {
            const extent = geometry.getExtent();
            coordinates = ol.extent.getCenter(extent);
        } else {
            console.warn("Geometría no compatible:", geometry);
            return;
        }

        map.getView().setCenter(coordinates);
        map.getView().setZoom(12);
        closeFilters(); // Cierra filtro de escritorio
        closeMobileFilters(); // Cierra filtro móvil si está abierto
        map.updateSize();
    }
}

function showAlert(message) {
    alert(message);
}
//-------------------------------------------------------------------------------------------------------------------------cell
// Función para alternar la visibilidad del contenedor de filtros
function closeMobileFilters() {
    const offcanvasElement = document.getElementById('sidebarOffcanvas');
    if (window.innerWidth < 992 && offcanvasElement) {
        const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
        if (offcanvas) offcanvas.hide();
    }
}

//Función para imprimir el popcon información de las escuelas:
function descargarPDF(claveCT) {
    const element = document.getElementById('popup-content-table');

    const opt = {
        margin: 0.3,
        filename: `ficha_${claveCT}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

// Nueva función para resetar los filtros 

function resetFilters() {
    activeLevelFilter = 'all';
    activeShiftFilter = 'all';
    updateMap();
    highlightSelectedFilter('Nivel', 'all');
    highlightSelectedFilter('Turno', 'all');
    closeFilters(); // Cierra filtro de escritorio
    closeMobileFilters(); // Cierra filtro móvil si está abierto
    map.updateSize();
}

function highlightSelectedFilter(tipo, valor) {
    const normalized = valor === 'all' ? 'TODOS' : valor.toUpperCase();

    const isNivel = tipo.toLowerCase() === 'nivel';
    const isTurno = tipo.toLowerCase() === 'turno';

    // Escritorio
    document.querySelectorAll('#filterContainer .menu-item').forEach(item => {
        const text = item.textContent.trim().toUpperCase();

        if (isNivel && item.dataset.tipo === 'nivel') {
            item.classList.toggle('active', text === normalized);
        } else if (isTurno && item.dataset.tipo === 'turno') {
            item.classList.toggle('active', text === normalized);
        }
    });

    // Móvil
    document.querySelectorAll('#filterContainerMobile .menu-item').forEach(item => {
        const text = item.textContent.trim().toUpperCase();

        if (isNivel && item.dataset.tipo === 'nivel') {
            item.classList.toggle('active', text === normalized);
        } else if (isTurno && item.dataset.tipo === 'turno') {
            item.classList.toggle('active', text === normalized);
        }
    });
}

// para detectar el movimiento en el mapa 
map.on('moveend', () => {
    updateMap(); // Llama a la función que filtra y luego ejecuta addMarkers()
});




// Funciones para mostrar las 10 escuelas con mayor prioridad por región.---------------------------------------------------

function handleRegionSelection() {

  const regionId = document.getElementById('regionSelect').value;
  const schoolSelect = document.getElementById('schoolSelect');
  schoolSelect.innerHTML = '';
  schoolSelect.disabled = true;

  if (!regionId) return;

  // Separar por nivel
const primarias = escuelas
  .filter(e => e.region == regionId && e.nivel === 'PRIMARIA' && e.Orden_Porcent_DR != null)
  .sort((a, b) => a.Orden_Porcent_DR - b.Orden_Porcent_DR)
  .slice(0, 10);

const secundarias = escuelas
  .filter(e => e.region == regionId && e.nivel === 'SECUNDARIA' && e.Orden_Porcent_DR != null)
  .sort((a, b) => a.Orden_Porcent_DR - b.Orden_Porcent_DR)
  .slice(0, 10);

const filtered = [...primarias, ...secundarias];

  if (filtered.length === 0) {
    const option = document.createElement('option');
    option.text = 'No hay escuelas disponibles';
    schoolSelect.appendChild(option);
    return;
  }

// opción po defecto
  const defaultOption = document.createElement('option');
  defaultOption.text = 'Selecciona una escuela';
  defaultOption.value = '';
  schoolSelect.appendChild(defaultOption);
  
// Creación de la lista en el select
  filtered.forEach(e => {
    const option = document.createElement('option');
    option.value = e.clavect;
    option.text = `${e.nivel} - ${e.nombre} (${e.clavect}) - #${e.Orden_Porcent_DR}`;
    schoolSelect.appendChild(option);
  });

  schoolSelect.disabled = false;

  // Centrar en la región (opcional)
  const feature = municipiosSource.getFeatures().find(f => f.get('Region') == regionId);
  if (feature) {
    const geometry = feature.getGeometry();
    const center = geometry.getType() === 'Polygon'
      ? geometry.getInteriorPoint().getCoordinates()
      : ol.extent.getCenter(geometry.getExtent());
    map.getView().animate({ center, zoom: 10, duration: 600 });
  }
}

// END handleRegionSelection ---->



//Función para la selección de la escuela por nivel de logro
function handleSchoolSelection() {
  const selectedCCT = document.getElementById('schoolSelect').value;
  if (!selectedCCT) return;
  searchSchoolByClaveCTManual(selectedCCT);
}

// Función auxiliar para reutilizar lógica de búsqueda (sin input box)
function searchSchoolByClaveCTManual(claveCT) {
  const searchErrorMessage = document.getElementById('searchErrorMessage');
  if (searchErrorMessage) searchErrorMessage.textContent = '';

  const school = escuelas.find(escuela => escuela.clavect === claveCT);
  if (!school) {
    if (searchErrorMessage) searchErrorMessage.textContent = 'Escuela no encontrada';
    return;
  }

  const coordinates = ol.proj.fromLonLat(school.latlng);

  map.getView().animate({
    center: coordinates,
    zoom: 16,
    duration: 500
  });

  setTimeout(() => {
    content.innerHTML = `
      <div id="popup-content-table">
        <table class="table table-bordered table-striped table-sm popup-table">
          <tbody>
            <tr><th>Clave CT</th><td>${school.clavect}</td></tr>
            <tr><th>Nombre</th><td>${school.nombre}</td></tr>
            <tr><th>Turno</th><td>${school.turno}</td></tr>
            <tr><th>Total de estudiantes</th><td>${school.alumnos}*</td></tr>
            <tr><th>Estudiantes en situación de abandono</th><td>${school.Abandonantes}*</td></tr>

            <tr class="table-primary text-center"><th colspan="2">Alumnos por nivel de los resultados de logro</th></tr>
            <tr><td>Español Nivel I</td><td>${school.Esp_Nivel_I} (${school.Esp_PercentI}%)</td></tr>
            <tr><td>Español Nivel II</td><td>${school.Esp_Nivel_II} (${school.Esp_PercentII}%)</td></tr>
            <tr><td>Matemáticas Nivel I</td><td>${school.Mat_Nivel_I} (${school.Mat_PercentI}%)</td></tr>
            <tr><td>Matemáticas Nivel II</td><td>${school.Mat_Nivel_II} (${school.Mat_PercentII}%)</td></tr>

            <tr class="table-primary text-center"><th colspan="2">Comprensión Lectora</th></tr>
            <tr><td>Domina</td><td>${school.Esp_Dom1} (${school.Percent_EspDom1}%)</td></tr>
            <tr><td>En proceso</td><td>${school.Esp_Dom2} (${school.Percent_EspDom2}%)</td></tr>
            <tr><td>Sin comprensión</td><td>${school.Esp_Dom3} (${school.Percent_EspDom3}%)</td></tr>

            <tr class="table-primary text-center"><th colspan="2">Operaciones Matemáticas</th></tr>
            <tr><td>Domina</td><td>${school.Mat_Dom1} (${school.Percent_MatDom1}%)</td></tr>
            <tr><td>En proceso</td><td>${school.Mat_Dom2} (${school.Percent_MatDom2}%)</td></tr>
            <tr><td>No domina</td><td>${school.Mat_Dom3} (${school.Percent_MatDom3}%)</td></tr>
            <tr class="footer-note"><td colspan="2"><em>Datos RIMA 2024</em></td></tr>
            <tr class="footer-note"><td colspan="2"><em>* Datos control escolar 2025</em></td></tr>
          </tbody>
        </table>
      </div>
      <div class="text-center mt-2">
        <button class="btn btn-sm btn-outline-danger" onclick="descargarPDF('${school.clavect}')">
          <i class="bi bi-file-earmark-pdf"></i> Imprimir CCT
        </button>
      </div>`;
    overlay.setPosition(coordinates);
  }, 600);
}

// cambiar en la base de datos el id para el municipio-----------------------------------------------------
// Funciones para la busqueda de cct por nombre agregar al codigo de Nancy
function buscarEscuelasPorNombre() {
  const municipio = document.getElementById('municipioSelector').value.toLowerCase();
  const textoBusqueda = document.getElementById('nombreEscuelaInput').value.trim().toLowerCase();
  const lista = document.getElementById('sugerenciasEscuelas');

  lista.innerHTML = '';

  if (!municipio) {
    alert('Por favor, selecciona un municipio antes de buscar una escuela por nombre.');
    return;
  }

  if (!textoBusqueda || !escuelas || escuelas.length === 0) return;

  const textoNormalizado = textoBusqueda.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
  const municipioNormalizado = municipio.normalize("NFD").replace(/[\u0300-\u036f]/g, '');

  const resultados = escuelas.filter(e => {
    const nombreNormalizado = e.nombre?.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '');
    const municipioEscuelaNormalizado = e.Municipio?.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '');

    return nombreNormalizado?.includes(textoNormalizado) && municipioEscuelaNormalizado === municipioNormalizado;
  });

  resultados.forEach(escuela => {
    const option = document.createElement('option');
    option.value = `${escuela.nombre} (${escuela.clavect})`;
    lista.appendChild(option);
  });
}

//------------------------------
function seleccionarEscuelaPorNombre() {
  const input = document.getElementById('nombreEscuelaInput');
  const valorSeleccionado = input.value;

  // Extraer CCT entre paréntesis
  const match = valorSeleccionado.match(/\(([^)]+)\)$/);
  if (!match) {
    //alert('Por favor, selecciona una opción válida de la lista desplegable.');
    return;
  }

  const claveCT = match[1];
  searchSchoolByClaveCTManual(claveCT);
}
// End de los filtros de prioridad


// Llamar la primera vez
window.onload = function () {
    loadSchoolsFromJSON();
    loadMunicipios('municipioSelector');        // Desktop
    loadMunicipios('municipioSelectorMobile');  // Mobile
};