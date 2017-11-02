package com.example.daviddryburgh.onlinemysqldb;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class MainActivity extends Activity {

    Button B1, B2, B3;
    TextView textView;
    TextView jsonTextView;
    String JSON_STRING;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        B1 = (Button) findViewById(R.id.b1);
        B2 = (Button) findViewById(R.id.b2);
        B3 = (Button) findViewById(R.id.b3);
        textView = (TextView) findViewById(R.id.textView);
        jsonTextView = (TextView) findViewById(R.id.jsonTextView);
        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo networkInfo = connectivityManager.getActiveNetworkInfo();


        if(networkInfo!=null && networkInfo.isConnected())
        {
            textView.setVisibility(View.INVISIBLE);
        }
        else
        {
            B1.setEnabled(false);
            B2.setEnabled(false);
        }
    }

    public void addContact(View view)
    {
        startActivity(new Intent(this,AddInfo.class));
    }

    public void getJSON(View view)
    {
            new BackgroundTask().execute();

    }

    public void parseJSON(View view)
    {
            if(JSON_STRING==null)
            {
                Toast.makeText(getApplicationContext(), "First Get JSON", Toast.LENGTH_LONG).show();
            }
            else
            {
                Intent intent = new Intent(this, DisplayListView.class);
                intent.putExtra("json_data", JSON_STRING);
                startActivity(intent);
            }

    }

    class BackgroundTask extends AsyncTask<Void, Void, String>
    {
        String json_url;

        @Override
        protected void onPreExecute() {
            json_url = "http://punier-boresights.000webhostapp.com/json_get_data.php";
        }

        @Override
        protected String doInBackground(Void... voids) {

            try {
                URL url = new URL(json_url);
                HttpURLConnection httpURLConnection = (HttpURLConnection)url.openConnection();
                InputStream inputStream = httpURLConnection.getInputStream();
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                StringBuilder stringBuilder = new StringBuilder();

                while((JSON_STRING = bufferedReader.readLine())!=null)
                {
                    stringBuilder.append(JSON_STRING+"\n");
                }

                bufferedReader.close();
                inputStream.close();
                httpURLConnection.disconnect();

                return stringBuilder.toString().trim();
            }
            catch (MalformedURLException e) {
                e.printStackTrace();
            }
            catch(IOException e){
                e.printStackTrace();
            }

            return null;
        }

        @Override
        protected void onProgressUpdate(Void... values) {
            super.onProgressUpdate(values);
        }

        @Override
        protected void onPostExecute(String result) {
            jsonTextView.setText(result);

            JSON_STRING = result;
        }
    }
}
