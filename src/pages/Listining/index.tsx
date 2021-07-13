import React, { MouseEvent, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { parseCookies, setCookie } from "nookies";
import Router from "next/router";

//material-ui
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Fab from "@material-ui/core/Fab";
import Container from "@material-ui/core/Container";
import AddIcon from "@material-ui/icons/Add";
import Box from "@material-ui/core/Box";
import { IconButton } from "@material-ui/core";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

import Copyright from "@components/Copyright";
import { Context } from "@store/context/ListiningContext";
import TableRows from "./componentsListining/TableRows";
import Header from "./componentsListining/Header";
import Title from "./componentsListining/Title";
import Modal from "./componentsListining/ModalCreate";
import useStyles from "./UseStyles";
import { getApiClient } from "@services/api/serverSide";
import Pagination from "src/hooks/pagination";
import { iunicPerson, persons } from "src/types/";

function Listining({
  allPersonsTable,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const sizePage = 7;

  //global context
  const { handleOpenCreate, currentPage, setCurrentPage} = useContext(Context);

  const [fullyear, setFulyear] = useState<number>();
  const [refresh, setRefresh] = useState(false);
  const [out, setOut] = useState(false);
  const [arrayPersons, setArrayPersons] = useState<Array<Array<iunicPerson>>>(
    []
  );

  const { pages, smaller, pagination } = Pagination(sizePage, allPersonsTable);

  const handlePage = (current: number) => {
    current < 0
      ? setCurrentPage(currentPage - 1)
      : setCurrentPage(currentPage + 1);
  };

  const handleRouteChange = () => {
    let h = !refresh;
    setRefresh(h);
  };
  
  const routerChangeStart = () => {
    let r = !out;
    setOut(r);
  };
  
  
  Router.events.on("hashChangeStart", handleRouteChange);
  Router.events.on("hashChangeComplete", handleRouteChange);
  useEffect(() => {
    (async () => {
      try {
        let cookies = parseCookies(undefined);
        let cP = parseInt(cookies["Leadsoft.currentPage"]);
        setCurrentPage(cP);
        pagination();
      } catch (error) {
        alert("Erro no servidor: " + error.message);
      }
    })();
    let y = new Date().getFullYear();
    setFulyear(y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);
  
  Router.events.on("routeChangeStart", routerChangeStart);
  useEffect(() => {
    setCookie(undefined, "Leadsoft.currentPage", `${currentPage}`, {
      expires: new Date( new Date().getFullYear() + 50, 1, 1  )
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [out, refresh])

  useEffect(() => {
    (() => {
      let tempArray2: Array<Array<iunicPerson>> = [];
      for (let i = 0; i < allPersonsTable.length - 1; i++) {
        //temporary Array
        let tempArray: iunicPerson[] = [];
        for (let j = i; j <= i + sizePage; j++) {
          //test  if the next is undefined
          if (allPersonsTable[j + 1] == undefined) {
            tempArray.push(allPersonsTable[j]);
            tempArray2.push(tempArray);
            i = j + 1;
            break;
          }
          //test if the next is the last of this loop
          if (j + 1 == i + sizePage) {
            i = j;
            tempArray.push(allPersonsTable[j]);
            tempArray2.push(tempArray);
            break;
          }
          tempArray.push(allPersonsTable[j]);
        }
      }
      setArrayPersons(tempArray2);
    })();
  }, []);

  // console.log(arrayPersons);

  const classes = useStyles();
  return (
    <>
      {<Modal />}
      <Header />
      <Container maxWidth="lg" classes={{ root: classes.container }}>
        <Grid container>
          <Grid item xs={12}>
            <Paper classes={{ root: classes.paper }}>
              <Grid
                container
                spacing={1}
                classes={{ root: classes.containerPerson }}
              >
                <Grid item>
                  <Fab
                    color="secondary"
                    aria-label="add"
                    onClick={handleOpenCreate}
                  >
                    <AddIcon />
                  </Fab>
                </Grid>
                <Grid item>
                  <Title>Persons</Title>
                </Grid>
              </Grid>
              <Table size="small">
                <TableHead classes={{ root: classes.headTable }}>
                  <TableRow>
                    <TableCell classes={{ root: classes.headTableCell }}>
                      Nome Completo
                    </TableCell>
                    <TableCell classes={{ root: classes.headTableCell }}>
                      Idade
                    </TableCell>
                    <TableCell classes={{ root: classes.headTableCell }}>
                      Altura
                    </TableCell>
                    <TableCell classes={{ root: classes.headTableCell }}>
                      Peso
                    </TableCell>
                    <TableCell classes={{ root: classes.headTableCell }}>
                      Imc
                    </TableCell>
                    <TableCell
                      align="right"
                      classes={{ root: classes.headTableCell }}
                    >
                      editar
                    </TableCell>
                    <TableCell
                      align="right"
                      classes={{ root: classes.headTableCell }}
                    >
                      excluir
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRows
                    persons={arrayPersons}
                    fullyear={fullyear}
                    currentPage={currentPage}
                  />
                </TableBody>
              </Table>
              <Grid container classes={{ root: classes.containerButtons }}>
                {currentPage == 0 || smaller ? null : (
                  <Grid item className={classes.buttonsPageLeft}>
                    <IconButton onClick={() => handlePage(-1)}>
                      <KeyboardArrowLeftIcon color="primary" />
                    </IconButton>
                  </Grid>
                )}
                <Grid item classes={{ root: classes.page }}>
                  página: {currentPage + 1}
                </Grid>
                {currentPage == pages || smaller ? null : (
                  <Grid item className={classes.buttonsPageRight}>
                    <IconButton onClick={() => handlePage(1)}>
                      <KeyboardArrowRightIcon color="primary" />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
              <Box mt={8}>
                <Copyright />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Listining;

//server side

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  const token = cookies["Leadsoft.Authorization"];
  const currentPage = cookies["Leadsoft.currentPage"];

  const api = getApiClient(ctx);

  if (!token) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const allPersonsTable = await api
    .get(`/api/v1/People`)
    .then((res) => res.data)
    .catch((e) => alert(`Erro na requisiçao ao servidor: ${e.message}`));

  return {
    props: {
      allPersonsTable,
    },
  };
};
