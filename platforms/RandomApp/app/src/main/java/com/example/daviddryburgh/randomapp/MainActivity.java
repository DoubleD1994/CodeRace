package com.example.daviddryburgh.randomapp;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.support.v4.app.NotificationCompat;
import android.view.View;

public class MainActivity extends AppCompatActivity {


    NotificationCompat.Builder notification;
    private static final int uniqueID = 45612;

    EditText username;
    EditText password;
    EditText confirm;
    EditText email;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        notification = new NotificationCompat.Builder(this);
        //deletes any notification when open the app
        notification.setAutoCancel(true);

        username = (EditText) findViewById(R.id.usernameText);
        password = (EditText) findViewById(R.id.passwordText);
        confirm = (EditText) findViewById(R.id.confirmText);
        email = (EditText) findViewById(R.id.emailText);
    }

    public void buttonClick(View view)
    {
        //Build the notification

        //icon for the notification
        notification.setSmallIcon(R.mipmap.ic_launcher);
        //ticker for the notification
        notification.setTicker("This is the ticker");
        //set time for notification
        notification.setWhen(System.currentTimeMillis());
        //Title for the notification
        notification.setContentTitle(username.getText().toString());
        //set text

        if(password.getText().toString().equals(confirm.getText().toString())) {
            notification.setContentText(email.getText().toString());
        }
        Intent intent = new Intent(this, MainActivity.class);
        //this line gives phone access to intent in app
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
        notification.setContentIntent(pendingIntent);

        //Build notification and issues it
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        nm.notify(uniqueID, notification.build());
    }
}
