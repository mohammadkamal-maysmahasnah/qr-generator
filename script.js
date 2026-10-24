(function () {
  "use strict";

  const form = document.getElementById("qr-form");
  const input = document.getElementById("url-input");
  const error = document.getElementById("error-message");
  const result = document.getElementById("result");
  const qrContainer = document.getElementById("qrcode");
  const resultUrl = document.getElementById("result-url");
  const downloadButton = document.getElementById("download-button");

  document.getElementById("year").textContent = new Date().getFullYear();

  function normalizeUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) throw new Error("أدخل رابط الموقع أولًا.");
    let candidate = trimmed;
    if (!/^https?:\/\//i.test(candidate)) candidate = "https://" + candidate;

    let parsed;
    try {
      parsed = new URL(candidate);
    } catch (_) {
      throw new Error("الرابط غير صحيح. مثال: https://example.com");
    }

    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) {
      throw new Error("أدخل رابطًا صحيحًا مثل https://example.com");
    }
    return parsed.href;
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
  }

  function clearError() {
    error.textContent = "";
    error.hidden = true;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearError();

    let url;
    try {
      url = normalizeUrl(input.value);
    } catch (err) {
      result.hidden = true;
      showError(err.message);
      return;
    }

    if (typeof QRCode === "undefined") {
      showError("تعذّر تحميل مكتبة إنشاء QR. تحقق من اتصال الإنترنت ثم أعد تحميل الصفحة.");
      return;
    }

    qrContainer.replaceChildren();
    result.hidden = false;
    resultUrl.textContent = url;

    try {
      new QRCode(qrContainer, {
        text: url,
        width: 300,
        height: 300,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (_) {
      showError("تعذّر إنشاء الرمز. جرّب رابطًا أقصر.");
      result.hidden = true;
    }
  });

  downloadButton.addEventListener("click", function () {
    const canvas = qrContainer.querySelector("canvas");
    const image = qrContainer.querySelector("img");
    let dataUrl = "";

    if (canvas) {
      try {
        dataUrl = canvas.toDataURL("image/png");
      } catch (_) {}
    }
    if (!dataUrl && image && image.src && image.src.startsWith("data:image")) {
      dataUrl = image.src;
    }

    if (!dataUrl) {
      showError("لم تجهز صورة الباركود بعد. أنشئ الرمز أولًا ثم حاول التنزيل.");
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qr-code.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
})(); 
