import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {usingCanvasMode} from "@/api/globalSettings";
import uofmData from "./../../assets/data/UofM_Grade_Distributions.js";
import msuData from "./../../assets/data/MSU_Avg_Grade_Distributions.js";

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


  // TODO: Implement search functionality
  async function handleSearch() {
    // let [{ localUri }] = usingCanvasMode()
    // ? await Asset.loadAsync(require('./../../assets/data/UofM_Grade_Distributions.csv'))
    // : await Asset.loadAsync(require('./../../assets/data/MSU_Avg_Grade_Distributions.csv'))
    const csvString = usingCanvasMode() ? uofmData : msuData;

    const parsedData = parseCsv(csvString);

    console.log('parsedData: ', parsedData);

    console.log("now going to filter...");

    const filtered = parsedData.filter((item: any) => {
        const courseTitle = item['Crse Descr'] || item['COURSE_TITLE_DESCR'] || '';
        const passName =
          courseName === '' ||
          courseTitle.toLowerCase().includes(courseName.toLowerCase());
        const passDept =
          department === '' ||
          (item['SUBJECT'] || '').toLowerCase() === department.toLowerCase();
        const itemGpa = parseFloat(item['Avg GPA']) || 0;
        const passGpaMin = gpaMin === '' || itemGpa >= parseFloat(gpaMin);
        const passGpaMax = gpaMax === '' || itemGpa <= parseFloat(gpaMax);
        return passName && passDept && passGpaMin && passGpaMax;
      });

    console.log('filtered: ', filtered);

    console.log("now going to sort...");

      const sorted = filtered.sort((a: any, b: any) => {
        const gpaA = parseFloat(a['Avg GPA']) || 0;
        const gpaB = parseFloat(b['Avg GPA']) || 0;
        return sortOrder === 'asc' ? gpaA - gpaB : gpaB - gpaA;
      });

    console.log("now going to set results...");

    console.log('sorted: ', sorted);

    setResults(sorted);
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
  renderItem={({ item }) => {
    const courseTitle = item['Crse Descr'] || item['COURSE_TITLE_DESCR'] || '';
    const displaySubjectId = (item['SUBJECT'] || '') + ' ' + (item['Course ID'] || '');
    return (
      <View style={styles.resultBox}>
        <View>
          <Text style={styles.resultCourseId}>{displaySubjectId}</Text>
          <Text style={styles.resultCourseTitle}>{courseTitle}</Text>
        </View>
        <Text style={styles.resultGPA}>
          {parseFloat(item['Avg GPA'] || 0).toFixed(2)}
        </Text>
      </View>
    );
  }}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  resultBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  resultCourseId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultCourseTitle: {
    fontSize: 14,
    color: '#666',
  },
  resultGPA: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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