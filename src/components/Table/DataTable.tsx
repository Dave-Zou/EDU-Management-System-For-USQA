import { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, ReactNode>[];
  rowKey: string;
  noDataText?: string;
}

const DataTable = ({ columns, data, rowKey, noDataText = '暂无数据' }: DataTableProps) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg">
        <div className="text-gray-400">{noDataText}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' : ''
                  } ${column.align === 'right' ? 'text-right' : ''}`}
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={String(row[rowKey])} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm text-gray-800 ${
                      column.align === 'center' ? 'text-center' : ''
                    } ${column.align === 'right' ? 'text-right' : ''}`}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;