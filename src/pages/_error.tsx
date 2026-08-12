import { NextPage } from "next";

interface ErrorPageProps {
  statusCode?: number;
}

const ErrorPage: NextPage<ErrorPageProps> = ({ statusCode }) => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : "An error occurred on client"}
      </h1>
      <p>Sorry for the inconvenience</p>
    </div>
  );
};

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
