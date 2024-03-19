import { Button } from '@shopify/polaris';
import { useAppQuery, useAuthenticatedFetch } from "../hooks";



export const FetchOrdersButton = ({updateOrdersData}) => {

  const fetch = useAuthenticatedFetch();

  const fetchOrders = async () => {

    const orders = await fetch("/api/orders")
    console.log('Fetching Orders')
    const dataObject = await orders.json()

    updateOrdersData(dataObject.data)
  }


  return (<Button primary={true} onClick={fetchOrders}>Fetch Unfulfilled Orders</Button>)
}