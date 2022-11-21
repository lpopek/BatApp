import React, {useEffect, useState} from 'react';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Box from '@mui/material/Box';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';




function getCordinateStr(cordinates) {
  var lat = cordinates[0] >= 0 ? 'N' : 'S';
  var long = cordinates[1] >= 0 ? 'E' : 'W';
  if (cordinates === 'N/A')
    return 'N/A'
  else
    return `${Math.abs(cordinates[0])} ${lat} ${Math.abs(cordinates[1])} ${long}`
}

function createDOIstr(doi){
  return `https://doi.org/${doi}`
}

const columns = [
  { id: 'id',
    label: 'Id',
    minWidth: 50 
  },
  {
    id: 'paper',
    label: 'Paper Name',
    minWidth: 250,
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
    minWidth: 200,
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

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

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

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%' }} className='map-container'>
      <TableContainer className='table-container'>
        <Table stickyHeader aria-label="sticky table" >
          <TableHead>
          <TableRow>
              {columns.map((column) => {
                if(column.id === 'doi' || column.id === 'virus_link'){
                  return(
                    <TableCell
                      key={column.id + '_filter_cell'}
                      align={column.align}
                      style={{ top: 0, minWidth: column.minWidth }}
                      >
                      {column.label}
                    </TableCell>
                  )
                }
                else{
                  return(
                    <TableCell
                        key={column.id + '_filter_cell'}
                        align={column.align}
                        style={{ top: 0, minWidth: column.minWidth }}
                      >
                        <TextField id={column.id + '_filter_field'} label={column.label} variant="outlined" />
                    </TableCell>
                  )
                }
            })}
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
                      if ((column.id == 'doi' && value !== 'N/A')||(column.id == 'virus_link' && value !== 'N/A')){
                        return (
                          <TableCell key={column.id} align={column.align}>
                            <Link href={createDOIstr(value)}>{column.label}</Link>
                        </TableCell>
                        )
                      }
                      else if (column.id == 'loc_0' && typeof props.isoData[value] !== 'undefined'){
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {props.isoData[value].name}
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
        rowsPerPageOptions={[5, 10, 25, 100, 500]}
        colSpan={5}
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        SelectProps={{
          inputProps: {
            'aria-label': 'rows per page',
          },
          native: true,
        }}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
        />
    </Paper>
  );
}
