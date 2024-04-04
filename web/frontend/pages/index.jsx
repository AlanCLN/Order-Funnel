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

import { useState, useEffect } from "react";

import { ProductsCard } from "../components/ProductsCard";
import { FetchOrdersButton } from "../components/FetchOrdersButton";

import { createYGOPullsheetUrl, createOthersPullsheetUrl } from "../scripts/pullsheet";
import { createPackingSlipUrl, parseOrdersData } from "../scripts/packing_slip";



export default function HomePage() {

  const fetch = useAuthenticatedFetch()

  const [ordersData, setOrdersData] = useState([])
  const [trackedData, setTrackedData] = useState([])
  const [oneStampUntrackedData, setOneStampUntrackedData] = useState([])  // 1-6 qty
  const [twoStampUntrackedData, setTwoStampUntrackedData] = useState([])  // 7-12 qty
  const [threeStampUntrackedData, setThreeStampUntrackedData] = useState([])  // 13-18 qty
  const [fourStampUntrackedData, setFourStampUntrackedData] = useState([])  // 19-20 qty
  const [fiveStampUntrackedData, setFiveStampUntrackedData] = useState([]) // 21-29 qty

  


  const updateOrdersData = data => {
    setOrdersData(data)
  }

  useEffect(() => {
    if (ordersData.length > 0) {
      const order_instances = parseOrdersData(ordersData)
      separateOrdersData(order_instances)
    }

  }, [ordersData])

  function separateOrdersData(order_instances) {
    const tracked = []
    const oneStamp = []
    const twoStamp = []
    const threeStamp = []
    const fourStamp = []
    const fiveStamp = []

    for (const order_instance of order_instances) {
      if (order_instance.requireTracking()) {
        tracked.push(order_instance)
      } else if (order_instance.getTotalQuantity() <= 6) {
        oneStamp.push(order_instance)
      } else if (order_instance.getTotalQuantity() <= 13) {
        twoStamp.push(order_instance)
      } else if (order_instance.getTotalQuantity() <= 19) {
        threeStamp.push(order_instance)
      } else if (order_instance.getTotalQuantity() <= 21) {
        fourStamp.push(order_instance)
      } else {
        fiveStamp.push(order_instance)
      }
    }

    setTrackedData(tracked)
    setOneStampUntrackedData(oneStamp)
    setTwoStampUntrackedData(twoStamp)
    setThreeStampUntrackedData(threeStamp)
    setFourStampUntrackedData(fourStamp)
    setFiveStampUntrackedData(fiveStamp)

  }


  async function createOneFulfillment() {
    const dataArray = ordersData

    if (dataArray) {
      let orderId = dataArray[0].id
      const response = await fetch(`/api/fulfillment/${orderId}`, {
        method: 'POST',
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



  function handlePullsheetDownload(pullsheetCategory) {

    let pullsheetUrl;

    if (pullsheetCategory === 'Yu-Gi-Oh!') {
      pullsheetUrl = createYGOPullsheetUrl(ordersData)
    } else {
      pullsheetUrl = createOthersPullsheetUrl(ordersData)
    }

    const filename = pullsheetCategory === "Yu-Gi-Oh!" ? 'ygo' : 'other'

    createAndClickAnchorElement(pullsheetUrl, `${filename}_pullsheet.csv`)
  }


  async function handlePackingSlipDownload(ordersData, fileName) {
    const packingSlipUrl = await createPackingSlipUrl(ordersData)

    // createAndClickAnchorElement(packingSlipUrl, `packing_slip_${fileName}.pdf`)
    window.open(packingSlipUrl)
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
              <Button primary onClick={() => handlePullsheetDownload('Yu-Gi-Oh!')}>YGO Pullsheet</Button>
              <Button primary onClick={() => handlePullsheetDownload('other')}>Other Pullsheet</Button>
              <Button primary disabled={trackedData.length == 0} onClick={() => handlePackingSlipDownload(trackedData, 'tracked')}>Track Packing Slip </Button>
              <Button primary disabled={oneStampUntrackedData.length == 0} onClick={() => handlePackingSlipDownload(oneStampUntrackedData, '1-6')}>Untrack Packing Slip 1-6 </Button>
              <Button primary disabled={twoStampUntrackedData.length == 0} onClick={() => handlePackingSlipDownload(twoStampUntrackedData, '7-12')}>Untrack Packing Slip 7-12 </Button>
              <Button primary disabled={threeStampUntrackedData.length == 0} onClick={() => handlePackingSlipDownload(threeStampUntrackedData, '13-18')}>Untrack Packing Slip 13-18 </Button>
              <Button primary disabled={fourStampUntrackedData.length == 0} onClick={() => handlePackingSlipDownload(fourStampUntrackedData, '19-20')}>Untrack Packing Slip 19-20 </Button>
              <Button primary disabled={fiveStampUntrackedData.length == 0} onClick={() => handlePackingSlipDownload(fiveStampUntrackedData, '21-29')}>Untrack Packing Slip 21-29 </Button>
              {/* <Button primary>Export Shipping</Button>
              <Button primary>Import Tracking</Button> */}
              {/* <Button primary onClick={createOneFulfillment}>Mark as Shipped (Testing)</Button> */}
              
            </ButtonGroup>
          </LegacyCard>
        </Layout.Section>
      </Layout>



    </Page>
  );
}
