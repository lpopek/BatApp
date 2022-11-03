import React, {useEffect, useState} from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';


function getCordinateStr(cordinates) {
  var lat = cordinates[0] >= 0 ? 'N' : 'S';
  var long = cordinates[1] >= 0 ? 'E' : 'W';

  return `${Math.abs(cordinates[0])} ${lat} ${Math.abs(cordinates[1])} ${long}`
}

function createDOIstr(doi){
  return `https://doi.org/${doi}`
}

const columns = [
  { id: 'id',
    label: 'Id',
    minWidth: 30 
  },
  {
    id: 'paper',
    label: 'Paper Name',
    minWidth: 190,
    align: 'right',
  },
  {
    id: 'doi',
    label: 'DOI',
    minWidth: 60,
    align: 'right',
    format: (value) => value.toLocaleString('en-US')
  },
  {
    id: 'date',
    label: 'Date of Publication',
    minWidth: 100,
    align: 'right',
    format: (value) => value.toLocaleString('en-US'),
  },
  { 
    id: 'bat', 
    label: 'Bat',
    minWidth: 100,
    align: 'right'
  },
  {
    id: 'virus',
    label: 'Virus',
    minWidth: 100,
    align: 'right',
  },
  {
    id: 'virus_link',
    label: 'Link to Virus Database',
    minWidth: 60,
    align: 'right',
    format: (value) => value.toLocaleString('en-US')
  },
  {
    id: 'geo_cord',
    label: 'Geog coordinates',
    minWidth: 60,
    align: 'right',
    format: (value) => value.toLocaleString('en-US')
  },
  {
    id: 'loc_0',
    label: 'Country',
    minWidth: 60,
    align: 'right',
    format: (value) => value.toLocaleString('en-US')
  },
  {
    id: 'loc_1',
    label: 'Subdevision_1',
    minWidth: 60,
    align: 'right',
    format: (value) => value.toLocaleString('en-US')
  },
];

function createData(id, paper, doi, date, bat, virus, virus_link, geo_cord, loc_0, loc_1) {
  return { id, paper, doi, date, bat, virus, virus_link, geo_cord, loc_0, loc_1};
}


export default function ColumnGroupingTable(props) {
  const[rows, fillRows] = useState([]);
  useEffect(() => {
      const discovers = props.tableData.reverse().map((item) => createData(
        item.id, 
        item.paper_name,
        item.doi,
        item.date, 
        item.bat, 
        item.virus,
        item.virus_link,
        getCordinateStr(item.cordinates), 
        item.country 
        ))
      fillRows(discovers)
  }, [props.tableData])

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%' }} className='map-container'>
      <TableContainer className='table-container'>
        <Table stickyHeader aria-label="sticky table" >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ top: 0, minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      if (column == 'doi'){
                        return (
                          <TableCell key={column.id} align={column.align}>
                            <Link href={createDOIstr(value)}>Link</Link>
                        </TableCell>
                        )
                      }
                      else{
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </TableCell>);
                      }
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        className='table-pagination'
      />
    </Paper>
  );
}
