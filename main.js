import { db } from './firebase-config.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-lite.js";
import jsPDF from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

let firmaClientePad, firmaTecnicoPad;

window.addEventListener('DOMContentLoaded', () => {
  // Inicializar firmas
  initSignaturePad('firmaCliente');
  initSignaturePad('firmaTecnico');

  const form = document.getElementById('serviceForm');
  const mensajeDiv = document.getElementById('mensaje');
  const formsTableBody = document.getElementById('formsTableBody');
  const exportPDFBtn = document.getElementById('exportPDFBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.set('firmaCliente', getCanvasDataURL('firmaCliente'));
    formData.set('firmaTecnico', getCanvasDataURL('firmaTecnico'));

    const dataToSave = {};
    for (const [key, value] of formData.entries()) {
      dataToSave[key] = value;
    }

    try {
      await addDoc(collection(db, "formularios"), dataToSave);
      mensajeDiv.textContent = 'Formulario enviado correctamente.';
      mensajeDiv.style.color = 'green';

      form.reset();
      clearCanvas('firmaCliente');
      clearCanvas('firmaTecnico');

      loadForms();
    } catch (error) {
      mensajeDiv.textContent = 'Error al enviar el formulario: ' + error.message;
      mensajeDiv.style.color = 'red';
    }
  });

  exportPDFBtn.addEventListener('click', exportPDF);

  loadForms(); // cargar registros al inicio
});

function initSignaturePad(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  let drawing = false;

  canvas.addEventListener("mousedown", () => drawing = true);
  canvas.addEventListener("mouseup", () => drawing = false);
  canvas.addEventListener("mouseout", () => drawing = false);
  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  });
}

function getCanvasDataURL(canvasId) {
  const canvas = document.getElementById(canvasId);
  return canvas.toDataURL();
}

function clearCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function loadForms() {
  const formsTableBody = document.getElementById('formsTableBody');
  formsTableBody.innerHTML = ''; // Limpiar tabla

  try {
    const querySnapshot = await getDocs(collection(db, "formularios"));
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${data.nombre || ''}</td>
        <td>${data.equipo || ''}</td>
        <td>${data.problema || ''}</td>
        <td><img src="${data.firmaCliente}" width="100"></td>
        <td><img src="${data.firmaTecnico}" width="100"></td>
      `;

      formsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error al cargar formularios:', error);
  }
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const table = document.getElementById("formsTable");
  if (!table) return alert("No se encontró la tabla de formularios");

  let y = 10;
  doc.setFontSize(12);
  doc.text("Formularios Guardados", 10, y);
  y += 10;

  const rows = table.querySelectorAll("tbody tr");
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll("td");
    let text = `#${index + 1}: `;
    text += Array.from(cells).slice(0, 3).map(cell => cell.textContent.trim()).join(" | ");
    doc.text(text, 10, y);
    y += 10;

    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save("formularios.pdf");
}
