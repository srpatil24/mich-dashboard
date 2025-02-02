import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface CourseData {
  courseName: string;
  GPA: number;
  department: string;
}

export default function SearchScreen() {
  const [courseName, setCourseName] = useState('');
  const [gpaMin, setGpaMin] = useState('');
  const [gpaMax, setGpaMax] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [department, setDepartment] = useState('');
  const [results, setResults] = useState<CourseData[]>([]);

  // Simulated CSV data for example
  const dataCsv = `courseName,instructor,department,courseNum
Intro to AI,Bob Joe,CS,582
Algebra,Sam Samson,MATH,634
React Basics,Johnny Test,CS,823
Database Systems,Bill the Hobo,IT,112
English Lit,Kanye West,HUM,101
`;

  function parseCsv(csvString: string) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map((line) => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });
  }

  function handleSearch() {
    let parsedData = parseCsv(dataCsv);

    setResults(parsedData);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Courses</Text>
      <TextInput
        style={styles.input}
        placeholder="Filter by Course Name"
        value={courseName}
        onChangeText={setCourseName}
      />
      <View style={styles.gpaContainer}>
  <TextInput
    style={[styles.input, { flex: 1, marginRight: 5 }]}
    placeholder="Min GPA"
    keyboardType="numeric"
    value={gpaMin}
    onChangeText={setGpaMin}
  />
  <TextInput
    style={[styles.input, { flex: 1, marginLeft: 5 }]}
    placeholder="Max GPA"
    keyboardType="numeric"
    value={gpaMax}
    onChangeText={setGpaMax}
  />
  <Picker
    selectedValue={sortOrder}
    style={{ flex: 1, marginLeft: 10 }}
    onValueChange={(itemValue) => setSortOrder(itemValue)}
  >
    <Picker.Item label="Ascending" value="asc" />
    <Picker.Item label="Descending" value="desc" />
  </Picker>
</View>
      <TextInput
        style={styles.input}
        placeholder="Filter by Department"
        value={department}
        onChangeText={setDepartment}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>{item.courseName}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: '600',
    color: '#fff',
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  gpaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
  },
  resultText: {
    fontSize: 16,
  },
});