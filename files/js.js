console.log("test");

// mobile menu slider
const toggle = document.querySelector(".navigation__toggle");
const close = document.querySelector(".navigation__close");
const content = document.querySelector(".content");

toggle.addEventListener("click", () => {
  content.classList.remove("none");
  content.classList.remove("close");
  content.classList.add("open");
});

close.addEventListener("click", () => {
  content.classList.remove("open");
  content.classList.add("close");
});


// input- file upload
const files = document.querySelector("#files")

files.onchange = function () {
  const fileName = this.files[0]?.name;
  const label = document.querySelector("#filesName");
  label.innerText = fileName ?? "Select file";
};




// regex validation for form
const inputs = document.querySelectorAll("input");

const patterns = {
  username: /^[a-z\d]{3,12}$/i,
  email: /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/,
  phone: /^\d{9}$/,
  company: /^[a-zA-Z0-9 _]*[a-zA-Z0-9_]+[a-zA-Z0-9 _]*$/,
  subject: /^[a-zA-Z0-9 _]*[a-zA-Z0-9_]+[a-zA-Z0-9 _]*$/,
};

inputs.forEach((input) => {
  input.addEventListener("keyup", (e) => {
    validate(e.target, patterns[e.target.attributes.id.value]);
  });
});

function validate(field, regex) {
  if (regex.test(field.value)) {
    field.className = "form-control valid";
  } else {
    field.className = "form-control invalid";
  }
}
