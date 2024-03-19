import {
  Page,
  Layout,
  LegacyCard,
  ButtonGroup,
  Image,
  Link,
  Text,
  Button
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

import { useState } from "react";

import { ProductsCard } from "../components/ProductsCard";
import { FetchOrdersButton } from "../components/FetchOrdersButton";

import { createPullsheetUrl } from "../scripts/pullsheet";
import { createPackingSlipUrl } from "../scripts/packing_slip";



export default function HomePage() {

  const fetch = useAuthenticatedFetch()

  const [ordersData, setOrdersData] = useState([])
  const updateOrdersData = data => {
    setOrdersData(data)
  }


  async function createOneFulfillment() {
    const dataArray = ordersData.data

    if (dataArray) {
      let orderId = dataArray[0].id
      const response = await fetch(`/api/order/${orderId}`, {
        method: 'PUT',
      })
      const responseData = await response.json()
      console.log(responseData)
    } else {
      console.log("No orders data")
    }
  }

  
  const createAndClickAnchorElement = (url, fileName) => {

    // Create anchor element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);

    // Programmatically click on the anchor element to trigger download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }



  function handlePullsheetDownload() {
    const pullsheetUrl = createPullsheetUrl(ordersData)

    createAndClickAnchorElement(pullsheetUrl, 'pullsheet.csv')
  }


  async function handlePackingSlipPreview() {
    const packingSlipUrl = await createPackingSlipUrl(ordersData)

    // createAndClickAnchorElement(packingSlipUrl, 'packing_slip.pdf')
  }

  return (
    <Page
    title="Orders"
    primaryAction={<FetchOrdersButton updateOrdersData={updateOrdersData}/>}
    fullWidth>
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <ButtonGroup spacing="loose">
              <Button primary onClick={() => console.log(ordersData)}>{`Export Orders CSV (${ordersData.length})`}</Button>
              <Button primary onClick={handlePullsheetDownload}>Pullsheet</Button>
              <Button primary onClick={handlePackingSlipPreview}>Packing Slip</Button>
              <Button primary>Export Shipping</Button>
              <Button primary>Import Tracking</Button>
              <Button primary onClick={createOneFulfillment}>Mark as Shipped (Testing)</Button>
              
            </ButtonGroup>
          </LegacyCard>
        </Layout.Section>
      </Layout>



    </Page>
  );
}
