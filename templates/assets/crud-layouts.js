document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-crud-table]').forEach((table) => {
    new DataTable(table, {
      responsive: true,
      pageLength: 6,
      lengthMenu: [6, 10, 25, 50],
      order: [],
      columnDefs: [{ orderable: false, targets: 0 }],
      language: {
        search: 'Busca rápida',
        lengthMenu: '_MENU_ por página',
        info: '_START_ a _END_ de _TOTAL_ registros',
        infoEmpty: 'Nenhum registro',
        zeroRecords: 'Nenhum resultado encontrado',
        paginate: {
          next: 'Próxima',
          previous: 'Anterior'
        }
      }
    });
  });
});
