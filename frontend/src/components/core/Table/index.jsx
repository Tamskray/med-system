import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import MuiTable from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { ASC, DESC } from "./constants";

const Table = ({ data, columns, sx = {}, emptyText = "No data available." }) => {
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(ASC);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    return [...data].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === ASC ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === ASC ? 1 : -1;
      return 0;
    });
  }, [data, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === ASC ? DESC : ASC);
    } else {
      setSortBy(key);
      setSortOrder(ASC);
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid rgba(0, 0, 0, 0.12)",
        borderRadius: "12px",
        overflow: "hidden",
        ...sx,
      }}
    >
      <TableContainer
        sx={{
          overflow: "auto",
          maxHeight: 560,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.18) transparent",
          "&::-webkit-scrollbar": {
            height: 10,
            width: 10,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.14)",
            borderRadius: 8,
          },
          "@media (max-width: 600px)": {
            maxHeight: "calc(100vh - 300px)",
          },
        }}
      >
        <MuiTable sx={{ minWidth: 650, tableLayout: "fixed" }} aria-label="data table">
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: "#f7f7f7",
              borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            }}
          >
            <TableRow>
              {columns.map((column, index) => {
                const sortable = column.sortable !== false;

                return (
                  <TableCell
                    key={column.key}
                    sx={{
                      width: column.width,
                      minWidth: column.minWidth || column.width,
                      maxWidth: column.maxWidth,
                      borderRight:
                        index < columns.length - 1 ? "1px solid rgba(0, 0, 0, 0.12)" : undefined,
                    }}
                  >
                    <TableSortLabel
                      active={sortable && sortBy === column.key}
                      direction={sortBy === column.key ? sortOrder : ASC}
                      onClick={sortable ? () => handleSort(column.key) : undefined}
                      disabled={!sortable}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      sx={{
                        width: column.width,
                        minWidth: column.minWidth || column.width,
                        maxWidth: column.maxWidth,
                      }}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ textAlign: "center", py: 4 }}>
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {sortedData.length > 0 && (
        <TablePagination
          component="div"
          count={sortedData.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{
            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
            "& .MuiIconButton-root": {
              "&:focus": { outline: "none" },
            },
          }}
        />
      )}
    </Box>
  );
};

export default Table;
