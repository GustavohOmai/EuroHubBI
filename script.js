function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

// Variável para armazenar os empregados
let employees = [];

// Primeiro fetch para popular o select
fetch(
  "https://special-agreement-447fb99dc0.strapiapp.com/api/treinos?populate=*"
)
  .then((response) => response.json())
  .then((data) => {
    const select = document.getElementById("aomai-options");
    data.data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.attributes.ContentTitle}`;
      select.appendChild(option);
    });

    // Captura mudanças no select
    select.addEventListener("change", function () {
      const selectedValue = select.value;

      // Fetch para os empregados do treino selecionado
      fetch(
        `https://special-agreement-447fb99dc0.strapiapp.com/api/treinos/${selectedValue}?populate=*`
      )
        .then((response) => response.json())
        .then((data) => {
          const newEmployees = data.data.attributes.employees.data.map(
            (employee) => ({
              employee_id: employee.attributes.employee_id,
              name: employee.attributes.name,
              department: employee.attributes.department,
              createdAt: null, // Inicializando com null
              signature: null, // Inicializando com null
            })
          );

          // Fetch para os dados do localhost
          fetch(`http://localhost:8080/${selectedValue}`)
            .then((response) => response.json())
            .then((localData) => {
              const localEmployees = localData.employees;

              console.log(newEmployees);
              console.log(localEmployees);

              // Atualiza os atributos para os empregados encontrados no localhost
              localEmployees.forEach((localEmp) => {
                const existingEmpIndex = newEmployees.findIndex(
                  (newEmp) =>
                    newEmp.employee_id === localEmp.employee_id.toString()
                );

                if (existingEmpIndex !== -1) {
                  // Remove o empregado antigo da nova lista
                  newEmployees.splice(existingEmpIndex, 1);
                }
                // Adiciona o empregado novo
                newEmployees.push({
                  employee_id: localEmp.employee_id,
                  name: localEmp.name,
                  department: localEmp.department,
                  createdAt: formatDate(localEmp.createdAt),
                  signature: localEmp.signature,
                });
              });

              // Popula a tabela com todos os empregados
              populateTable(newEmployees);
            })
            .catch((error) => {
              populateTable(newEmployees);
            });
        })
        .catch((error) =>
          console.error("Erro ao carregar os dados dos empregados:", error)
        );
    });
  })
  .catch((error) =>
    console.error("Erro ao carregar os dados iniciais:", error)
  );

// Função para popular a tabela de empregados
function populateTable(employees) {
  const tableBody = document.querySelector("#employee-table tbody");
  tableBody.innerHTML = ""; // Limpa a tabela antes de popular

  // Adiciona todos os empregados
  employees.forEach((emp) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <th scope="row">${emp.employee_id}</th>
      <td>${emp.name}</td>
      <td>${
        emp.signature
          ? '<img src="check.svg" alt="">'
          : '<img src="x.svg" alt="">'
      }</td>
      <td>${emp.department}</td>
      <td>${emp.createdAt || ""}</td>
      <td>
        <svg width="100px" height="100%" viewBox="0 0 442 256" preserveAspectRatio="xMidYMid meet">
          <g transform="rotate(90 128 221)"> <!-- Ajuste o ponto de rotação -->
            <path d="${emp.signature}" fill="none" stroke="black"/>
          </g>
        </svg>
      </td>
    `;
    tableBody.appendChild(row);
  });
}
