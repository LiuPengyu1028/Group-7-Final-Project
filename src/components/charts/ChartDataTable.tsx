type Props = {
  caption: string;
  columns: { key: string; label: string }[];
  rows: Record<string, string | number>[];
};

export function ChartDataTable({ caption, columns, rows }: Props) {
  return (
    <details className="chart-data-table">
      <summary>View data table</summary>
      <div className="table-wrap">
        <table>
          <caption>{caption}</caption>
          <thead><tr>{columns.map((column) => <th scope="col" key={column.key}>{column.label}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={index}>
            {columns.map((column, columnIndex) => columnIndex === 0
              ? <th scope="row" key={column.key}>{row[column.key]}</th>
              : <td key={column.key}>{typeof row[column.key] === "number" ? Number(row[column.key]).toLocaleString() : row[column.key]}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
    </details>
  );
}
