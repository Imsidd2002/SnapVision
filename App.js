import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from 'expo-speech';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned');
  const [productName, setProductName] = useState('');
  const [nutriScore, setNutriScore] = useState('');

  // What happens when we scan the barcode
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setText(`Barcode: ${data}`);
    console.log('Type: ' + type + '\nData: ' + data);

    // Fetch product details by barcode
    fetchProductByBarcode(data);
  };

  // Function to fetch product details by barcode
  const fetchProductByBarcode = async (barcode) => {
    const url = `https://world.openfoodfacts.net/api/v2/product/${barcode}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      // Extract the product name and nutriscore (nutrition_grades)
      const fetchedProductName = data.product.product_name || 'Unknown Product';
      const fetchedNutriScore = data.product.nutrition_grades || 'N/A';

      setProductName(fetchedProductName);
      setNutriScore(fetchedNutriScore);

      // Speak the product name aloud
      Speech.speak(`Product name is ${fetchedProductName}`);
    } catch (error) {
      console.error('Error fetching product:', error);
      setProductName('Error fetching product');
      setNutriScore('N/A');
      Speech.speak('Error fetching product');
    }
  };

  // Check permissions and return the screens
  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Return the View
  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417","aztec","ean13", "ean8", "qr","upc_e",
            "datamatrix","code39","code93","itf14","codabar","code128","upc_a"],
        }}
        style={styles.camera}
        // ratio="1:1" // Set camera to 4:3 aspect ratio
      />
      {scanned && (
        <Button title={"Tap to Scan Again"} style={styles.button} onPress={() => setScanned(false)} />
      )}
      <Text style={styles.productText}>Product Name : {productName}</Text>
      <Text style={styles.productText}>NutriScore: {nutriScore}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // flexDirection:"column",
    alignItems: 'center',
    justifyContent: 'center',
    gap:10,
    
    padding:75,
  },
  camera: {
    flex: 1,
    height:300,
    width:300, // This also helps in styling the camera to maintain a 4:3 ratio
  },
  productText: {
    fontSize: 18,
    margin: 10,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});
